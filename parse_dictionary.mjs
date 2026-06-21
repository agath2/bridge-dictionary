import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'node-html-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTML_PATH = path.join(__dirname, 'bridging_dictionary.html');
const OUT_DICT  = path.join(__dirname, 'dictionary.json');
const OUT_REPORT = path.join(__dirname, 'parse_report.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(word) {
  return word
    .toLowerCase()
    .replace(/['']/g, '')       // smart/straight apostrophes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripHtml(node) {
  // Return the plain text of a node with HTML entities decoded and tags removed.
  return node.innerText
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuotes(text) {
  // Strip surrounding curly/straight quotes and trailing punctuation from alternative phrases.
  return text
    .replace(/^["""''\s]+|["""''\s.,;]+$/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Parse a single entry node into a structured object
// ---------------------------------------------------------------------------

function parseEntry(entryNode) {
  const warnings = [];

  // 1. Headword
  const headwordSpan = entryNode.querySelector('.headword b');
  const headword = headwordSpan ? headwordSpan.innerText.trim() : '';
  if (!headword) warnings.push('missing headword');

  const slug = slugify(headword);

  // 2. Usage percentages
  const pctRed  = entryNode.querySelector('.pct_red');
  const pctBlue = entryNode.querySelector('.pct_blue');
  const republican_pct = pctRed  ? parseFloat(pctRed.innerText)  : null;
  const democrat_pct   = pctBlue ? parseFloat(pctBlue.innerText) : null;

  if (republican_pct === null || democrat_pct === null) {
    warnings.push('missing usage percentages');
  } else if (Math.abs(republican_pct + democrat_pct - 100) > 0.5) {
    warnings.push(`percentages sum to ${(republican_pct + democrat_pct).toFixed(1)}, expected ~100`);
  }

  // 3. Alternatives — collect all .alternative spans, clean surrounding quotes
  const alternatives = entryNode
    .querySelectorAll('.alternative')
    .map(n => cleanQuotes(stripHtml(n)))
    .filter(t => t.length > 0);

  // 4. Split into republican_text / democrat_text / full_text
  //
  //    Walk every child node of the entry in order. Maintain a `currentSide`
  //    variable that flips whenever we encounter a word_red or word_blue span.
  //    Append each text chunk to the appropriate bucket.
  //
  //    Nodes we skip entirely:
  //      - .headword  (the word being defined, not cohort text)
  //      - .usage     (the "Usage shares: X%, Y%" line)
  //      - .alternative (alternative phrasings — already captured separately)
  //      - <br>       (structural line breaks, no text content)
  //
  //    Known edge case — intro sentences:
  //      Some entries open with a sentence mentioning both cohorts together, e.g.
  //      "The Republican cohort and the Democrat cohort both use..."
  //      The word_blue span in that sentence flips currentSide to D, so the tail
  //      of that intro sentence lands in the D bucket. This is a minor contamination
  //      (one sentence fragment) that is acceptable for prompt generation purposes.
  //      These entries are flagged with a warning for transparency.

  const SKIP_CLASSES = new Set(['headword', 'usage', 'alternative']);

  let rBucket = '';
  let dBucket = '';
  let fullBucket = '';
  let currentSide = null; // null = before first cohort span; 'R' or 'D' after

  function collectText(raw) {
    return raw
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  function walkNode(node) {
    // Text node — route to current bucket
    if (node.nodeType === 3) {
      const text = collectText(node.rawText ?? node.text ?? '');
      if (!text.trim()) return;
      fullBucket += text;
      if (currentSide === 'R') rBucket += text;
      else if (currentSide === 'D') dBucket += text;
      return;
    }

    // Element node
    const cls = node.classList?.value ?? [];

    // Skip structural/metadata spans entirely (don't recurse into them)
    if (cls.some(c => SKIP_CLASSES.has(c))) return;

    // Cohort signal spans — flip side, then include their text in the new bucket
    if (cls.includes('word_red')) {
      currentSide = 'R';
      const text = collectText(node.innerText);
      fullBucket += text;
      rBucket += text;
      return;
    }
    if (cls.includes('word_blue')) {
      currentSide = 'D';
      const text = collectText(node.innerText);
      fullBucket += text;
      dBucket += text;
      return;
    }

    // Any other element — recurse into children
    for (const child of node.childNodes) {
      walkNode(child);
    }
  }

  for (const child of entryNode.childNodes) {
    walkNode(child);
  }

  const republican_text = rBucket.replace(/\s+/g, ' ').trim();
  const democrat_text   = dBucket.replace(/\s+/g, ' ').trim();
  const full_text       = fullBucket.replace(/\s+/g, ' ').trim();

  // Flag entries where word_blue appeared before any R-only content — likely an
  // intro sentence that mentions both cohorts. The D bucket will contain that
  // intro tail, which is acceptable contamination but worth knowing about.
  if (dBucket && !rBucket) {
    warnings.push('word_blue appeared before any word_red content — intro sentence may have contaminated D bucket');
  }

  // 5. Validate text lengths
  if (republican_text.length < 50) warnings.push(`republican_text suspiciously short (${republican_text.length} chars)`);
  if (democrat_text.length < 50)   warnings.push(`democrat_text suspiciously short (${democrat_text.length} chars)`);

  // 6. Check for HTML leakage in output fields
  for (const [field, value] of [
    ['republican_text', republican_text],
    ['democrat_text', democrat_text],
    ['full_text', full_text],
  ]) {
    if (/<[a-z]/i.test(value)) warnings.push(`HTML tag leakage in ${field}`);
  }

  return {
    headword,
    slug,
    republican_pct,
    democrat_pct,
    republican_text,
    democrat_text,
    full_text,
    alternatives,
    parse_warnings: warnings,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const html = fs.readFileSync(HTML_PATH, 'utf8');
const root = parse(html);

const entryNodes = root.querySelectorAll('div.entry');
const entries = entryNodes.map(parseEntry);

// ---------------------------------------------------------------------------
// Build report
// ---------------------------------------------------------------------------

const EXPECTED_ENTRIES = 736; // HTML version 0.1 (2023-07-10) contains 736 entries
const totalEntries = entries.length;
if (totalEntries !== EXPECTED_ENTRIES) {
  console.warn(`⚠ Expected ${EXPECTED_ENTRIES} entries, got ${totalEntries}`);
}
const withWarnings = entries.filter(e => e.parse_warnings.length > 0);
const warningCounts = {};
for (const e of withWarnings) {
  for (const w of e.parse_warnings) {
    const key = w.replace(/\d+/g, 'N'); // normalise numbers for grouping
    warningCounts[key] = (warningCounts[key] ?? 0) + 1;
  }
}

const report = {
  total_entries: totalEntries,
  entries_with_warnings: withWarnings.length,
  warning_summary: warningCounts,
  flagged_entries: withWarnings.map(e => ({
    headword: e.headword,
    slug: e.slug,
    warnings: e.parse_warnings,
  })),
};

// ---------------------------------------------------------------------------
// Write outputs
// ---------------------------------------------------------------------------

fs.writeFileSync(OUT_DICT, JSON.stringify(entries, null, 2), 'utf8');
fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), 'utf8');

// ---------------------------------------------------------------------------
// Console summary
// ---------------------------------------------------------------------------

console.log(`\n✓ Parsed ${totalEntries} entries`);

if (withWarnings.length === 0) {
  console.log('✓ No warnings — all entries parsed cleanly');
} else {
  console.log(`⚠ ${withWarnings.length} entries have warnings:\n`);
  for (const e of withWarnings) {
    console.log(`  ${e.headword}`);
    for (const w of e.parse_warnings) console.log(`    · ${w}`);
  }
  console.log(`\nWarning types:`);
  for (const [k, v] of Object.entries(warningCounts)) {
    console.log(`  ${v}x  ${k}`);
  }
}

console.log(`\nOutputs:`);
console.log(`  ${OUT_DICT}`);
console.log(`  ${OUT_REPORT}`);

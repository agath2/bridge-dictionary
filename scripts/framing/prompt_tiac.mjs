import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

const DICTIONARY_PATH = path.join(__dirname, '..', 'dictionary', 'dictionary.json');
const OUT_PATH = path.join(__dirname, 'prompts.json');

// Curated word list
const CURATED_SLUGS = [
  'illegal-alien',
  'asylum-seeker',
  'border-security',
  'deportation',
  'living-wage',
  'welfare',
  'working-poor',
  'homeschooling',
  'climate-change',
  'carbon-footprint',
  'renewable-energy',
  'police-brutality',
  'mass-shooting',
];

const SYSTEM_PROMPT = `You are a visual researcher helping design a political psychology game called "Through Whose Eyes?" The game shows players two AI-generated images for a politically charged word — one representing how Republicans tend to frame it, one representing how Democrats tend to frame it — and asks players to pick which image feels most accurate to them.

Your task: given a dictionary entry describing how Republicans and Democrats each use a specific word, generate two concrete photorealistic scene descriptions — one per side — suitable for an image generation API.

You must follow this reasoning chain for each side. Complete every step before moving to the next.

0. Quote — copy the exact sentence or phrase from the dictionary text that best captures this side's framing of the word. Everything that follows must derive from this quote.
1. Intent — what message or feeling does this quote communicate? Stay within what the quote says.
2. Object — what specific person, place, or thing from the quote best embodies that intent visually? It must be directly mentioned or unambiguously implied by the quote, not invented.
3. Form — what concrete scene puts that object in that context? Describe lighting, atmosphere, composition, and mood.

Then output a final image prompt that flows naturally from the Form layer.

Rules:
- Every layer must be traceable back to the Quote. If the quote does not mention it, do not include it.
- Each scene must be photorealistic and contain no text, logos, or legible signage.
- The scene must be visually distinct from the other side's scene — a viewer should be able to tell them apart immediately.
- Describe real-world scenes with real people, objects, and settings. No symbols, metaphors, or abstract imagery.
- Do not name political parties, politicians, or party affiliations in the prompts.

Respond with a JSON object in exactly this structure:
{
  "r_reasoning": {
    "quote": "...",
    "intent": "...",
    "object": "...",
    "form": "..."
  },
  "r_prompt": "...",
  "d_reasoning": {
    "quote": "...",
    "intent": "...",
    "object": "...",
    "form": "..."
  },
  "d_prompt": "..."
}`;

async function generatePrompts(entry) {
  const userMessage = `Word: "${entry.headword}"

Republican usage (${entry.republican_pct}% Republican):
${entry.republican_text}

Democrat usage (${entry.democrat_pct}% Democrat):
${entry.democrat_text}

Generate the intent → object → form reasoning and final image prompts for both sides.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const dictionary = JSON.parse(fs.readFileSync(DICTIONARY_PATH, 'utf-8'));
  const slugMap = Object.fromEntries(dictionary.map(e => [e.slug, e]));

  const missing = CURATED_SLUGS.filter(s => !slugMap[s]);
  if (missing.length > 0) {
    console.error(`Error: these slugs were not found in dictionary.json: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Load existing prompts.json so we can skip already-processed entries
  let existing = [];
  if (fs.existsSync(OUT_PATH)) {
    const parsed = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8'));
    existing = parsed.prompts ?? [];
  }
  const doneSet = new Set(existing.map(e => e.slug));

  const results = [...existing];
  const toProcess = CURATED_SLUGS.filter(s => !doneSet.has(s));

  if (toProcess.length === 0) {
    console.log('All entries already processed. Delete prompts.json to regenerate.');
    return;
  }

  console.log(`Processing ${toProcess.length} word(s)...\n`);

  for (let i = 0; i < toProcess.length; i++) {
    const slug = toProcess[i];
    const entry = slugMap[slug];
    console.log(`[${i + 1}/${toProcess.length}] ${entry.headword}`);

    try {
      const output = await generatePrompts(entry);

      results.push({
        slug: entry.slug,
        headword: entry.headword,
        r_reasoning: output.r_reasoning,
        r_prompt: output.r_prompt,
        d_reasoning: output.d_reasoning,
        d_prompt: output.d_prompt,
      });

      console.log(`  ✓ done`);
      console.log(`  R intent: ${output.r_reasoning.intent}`);
      console.log(`  D intent: ${output.d_reasoning.intent}`);
    } catch (e) {
      console.error(`  ✗ failed: ${e.message}`);
    }

    // Write after each word so progress is saved if the run is interrupted
    fs.writeFileSync(OUT_PATH, JSON.stringify({
      metadata: {
        method: 'tiac-v1',
        model: 'gpt-4o',
        dictionary_source: 'dictionary.json',
        image_style: 'photorealistic, editorial photography, no text in scene, 3:2 aspect ratio',
      },
      prompts: results,
    }, null, 2));

    if (i < toProcess.length - 1) await sleep(500);
  }

  console.log(`\n✓ prompts.json written with ${results.length} entries.`);
}

main().catch(console.error);

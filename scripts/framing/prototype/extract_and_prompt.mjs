import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

// Sampled tweet files live outside the repo (raw tweets should never be committed).
// Point this at wherever the sample .txt files from the corpus were extracted to.
const SAMPLES_DIR = process.env.TWEET_SAMPLES_DIR;
if (!SAMPLES_DIR) {
  console.error('Error: TWEET_SAMPLES_DIR environment variable is not set (folder containing <slug>_dem.txt / <slug>_repub.txt).');
  process.exit(1);
}

const OUT_PATH = path.join(__dirname, 'tweet_prompts.json');

const WORDS = [
  { slug: 'living-wage', headword: 'living wage' },
  { slug: 'climate-change', headword: 'climate change' },
];

const SIDES = [
  { fileTag: 'dem', key: 'd', label: 'Democrat' },
  { fileTag: 'repub', key: 'r', label: 'Republican' },
];

const SYSTEM_PROMPT = `You are a visual researcher helping design a political psychology game called "Through Whose Eyes?" The game shows players two AI-generated images for a politically charged word — one representing how Republicans tend to frame it, one representing how Democrats tend to frame it — and asks players to pick which image feels most accurate to them.

You will be given a batch of real, anonymized tweets from ONE political side, all mentioning a specific term. Your job is to find the recurring mental image this side associates with the term — a pattern across many tweets, not any single outlier — and turn it into a concrete photorealistic image prompt.

You must follow this reasoning chain. Complete every step before moving to the next.

0. Pattern — Read all the tweets. Identify the theme(s) that recur across MULTIPLE tweets: what setting, actors/objects, and emotional valence show up again and again. Quote 2-3 short representative phrases from different tweets that support this pattern. Ignore one-off tweets that don't fit the majority pattern.
1. Intent — what message or feeling does this recurring pattern communicate about the term? Stay within what the pattern actually shows.
2. Object — what specific person, place, or thing recurring across the tweets best embodies that intent visually? It must be grounded in the pattern, not invented.
3. Form — what concrete scene puts that object in that context? Describe lighting, atmosphere, composition, and mood.

Then output a final image prompt that flows naturally from the Form layer.

Rules:
- Every layer must be traceable back to the Pattern. If the tweets don't support it, do not include it.
- The scene must be photorealistic and contain no text, logos, or legible signage.
- Describe real-world scenes with real people, objects, and settings. No symbols, metaphors, or abstract imagery.
- Do not name political parties, politicians, or party affiliations in the prompt itself.

Respond with a JSON object in exactly this structure:
{
  "pattern": {
    "theme": "...",
    "representative_phrases": ["...", "...", "..."]
  },
  "intent": "...",
  "object": "...",
  "form": "...",
  "prompt": "..."
}`;

function loadTweets(slug, fileTag) {
  const filePath = path.join(SAMPLES_DIR, `${slug}_${fileTag}.txt`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw.split('\n').map(l => l.trim()).filter(Boolean);
}

async function extractAndPrompt(headword, sideLabel, tweets) {
  const numbered = tweets.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const userMessage = `Term: "${headword}"
Side: ${sideLabel}

Tweets (anonymized, @USER = redacted mention):
${numbered}

Find the recurring pattern across these tweets and generate the reasoning chain and final image prompt.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.5',
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
  const results = [];

  for (const word of WORDS) {
    console.log(`\n=== ${word.headword} ===`);
    const entry = { slug: word.slug, headword: word.headword };

    for (const side of SIDES) {
      console.log(`  Processing ${side.label} side...`);
      const tweets = loadTweets(word.slug, side.fileTag);
      console.log(`    (${tweets.length} tweets loaded)`);

      const output = await extractAndPrompt(word.headword, side.label, tweets);
      entry[`${side.key}_reasoning`] = {
        pattern: output.pattern,
        intent: output.intent,
        object: output.object,
        form: output.form,
      };
      entry[`${side.key}_prompt`] = output.prompt;

      console.log(`    ✓ pattern: ${output.pattern.theme}`);
      await sleep(500);
    }

    results.push(entry);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify({
    metadata: {
      method: 'tweet-tiac-prototype-v1',
      model: 'gpt-5.5',
      tweet_source: 'tweets2019.zip (proc files, ~40 tweets sampled per side per word)',
      image_style: 'photorealistic, editorial photography, no text in scene, 3:2 aspect ratio',
    },
    prompts: results,
  }, null, 2));

  console.log(`\n✓ ${OUT_PATH} written with ${results.length} entries.`);
}

main().catch(console.error);

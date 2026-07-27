import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
if (!STABILITY_API_KEY) {
  console.error('Error: STABILITY_API_KEY environment variable is not set.');
  process.exit(1);
}

const OUT_DIR = path.join(__dirname, 'images');
const PROMPTS_PATH = path.join(__dirname, 'tweet_prompts.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const { prompts } = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf-8'));

async function generateImage(prompt, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping (already exists): ${path.basename(outputPath)}`);
    return;
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'jpeg');
  formData.append('aspect_ratio', '3:2');

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${STABILITY_API_KEY}`,
      accept: 'image/*',
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  for (const entry of prompts) {
    console.log(`\n${entry.headword}`);

    const rPath = path.join(OUT_DIR, `${entry.slug}-r.jpg`);
    try {
      console.log('  Generating R...');
      await generateImage(entry.r_prompt, rPath);
      console.log('  ✓ R saved');
    } catch (e) {
      console.error(`  ✗ R failed: ${e.message}`);
    }
    await sleep(1000);

    const dPath = path.join(OUT_DIR, `${entry.slug}-d.jpg`);
    try {
      console.log('  Generating D...');
      await generateImage(entry.d_prompt, dPath);
      console.log('  ✓ D saved');
    } catch (e) {
      console.error(`  ✗ D failed: ${e.message}`);
    }
    await sleep(1000);
  }

  console.log(`\n✓ Images written to ${OUT_DIR}`);
}

main().catch(console.error);

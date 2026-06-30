import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = 'sk-bvGskZlaXN3C8yWOq5FPnm7syAoAwRtTj4N6vK412t7CG3JZ';
const OUT_DIR = path.join(__dirname, 'static', 'game2');
const PROMPTS_PATH = path.join(__dirname, 'prompts.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const { prompts } = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf-8'));
const words = prompts.map(e => ({
  slug: e.slug,
  word: e.headword,
  r: e.r_prompt,
  d: e.d_prompt,
}));

const _unused_words = [
  {
    slug: 'illegal-alien',
    word: 'illegal alien',
    r: 'A police officer handcuffing a man outside a convenience store at night. News headline visible on a nearby screen. Tense, documentary atmosphere. Photorealistic, editorial photography style, no text in scene.',
    d: 'A tired woman and two young children sitting on plastic chairs in a fluorescent-lit government waiting room, clutching paperwork. Quiet, exhausted. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'asylum-seeker',
    word: 'asylum seeker',
    r: 'A long line of people at a chain-link fence checkpoint at dusk, border agents in uniform reviewing documents. Crowded, procedural, skeptical atmosphere. Photorealistic, editorial photography style, no text in scene.',
    d: 'A young family — mother, father, small child — sitting on the ground outside a processing facility, wrapped in an emergency foil blanket. Humanitarian worker kneeling beside them. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'border-security',
    word: 'border security',
    r: 'A tall concrete border wall stretching across a desert landscape, a patrol vehicle driving alongside it. Vast, imposing, orderly. Photorealistic, editorial photography style, no text in scene.',
    d: 'A border agent at a computer workstation reviewing surveillance camera feeds. Technology-focused, administrative, calm office setting. Photorealistic, editorial photography style, no text in scene.'
  },
  // {
  //   slug: 'dreamers',
  //   word: 'dreamers',
  //   r: 'A stack of legal documents and a gavel on a courthouse desk. A form with handwritten notes, bureaucratic and procedural. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'Three young adults in graduation caps and gowns laughing together outside a university building. Hopeful, bright afternoon light. Photorealistic, editorial photography style, no text in scene.'
  // },
  {
    slug: 'deportation',
    word: 'deportation',
    r: 'Two uniformed officers escorting a man through a secured facility corridor. Official, procedural, law enforcement in action. Photorealistic, editorial photography style, no text in scene.',
    d: 'A woman clutching a young child at a chain-link fence, reaching through toward a man being led away by officials. Anguished, intimate. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'living-wage',
    word: 'living wage',
    r: 'A teenage boy behind a fast food counter in a uniform, handing change to a customer. Ordinary entry-level job, routine atmosphere. Photorealistic, editorial photography style, no text in scene.',
    d: 'A middle-aged woman in a supermarket uniform sitting on a break room bench, staring at a pile of bills and a near-empty wallet on the table. Worn down, quiet exhaustion. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'welfare',
    word: 'welfare',
    r: 'A long queue of people at a government assistance office. Fluorescent lighting, rows of plastic chairs, a bureaucratic window. Institutional, impersonal. Photorealistic, editorial photography style, no text in scene.',
    d: 'A mother helping her young daughter with homework at a kitchen table. Modest apartment, warm lamp light, a bag of groceries nearby. Steady, dignified. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'working-poor',
    word: 'working poor',
    r: 'A shuttered small business on a gentrified city block, new construction behind it, a displaced-looking older shopkeeper locking up for the last time. Photorealistic, editorial photography style, no text in scene.',
    d: 'A man in a warehouse uniform sitting in his car counting coins from his pocket after a long shift. Tired, parked under a streetlight at night. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'homeschooling',
    word: 'homeschooling',
    r: 'A parent sitting at a kitchen table with two children, textbooks and a whiteboard behind them, everyone engaged. Organized, deliberate, calm domestic scene. Photorealistic, editorial photography style, no text in scene.',
    d: 'A parent on a laptop with work documents open, a toddler tugging at their sleeve, a school worksheet abandoned on the table. Overwhelmed, scattered. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'climate-change',
    word: 'climate change',
    r: 'A coal plant with smokestacks against a clear blue sky, workers in hard hats in the foreground. Normal industrial workday, unremarkable. Photorealistic, editorial photography style, no text in scene.',
    d: 'A flooded suburban street, a car half-submerged, a family wading through knee-deep water carrying belongings. Urgent, disorienting. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'carbon-footprint',
    word: 'carbon footprint',
    r: 'A sleek private jet on a tarmac, a well-dressed figure boarding the steps. Opulence, implied hypocrisy. Photorealistic, editorial photography style, no text in scene.',
    d: 'A person on a bicycle commuting through a city, solar panels visible on rooftops behind them. Active, purposeful, everyday scale. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'renewable-energy',
    word: 'renewable energy',
    r: 'A wind turbine partially dismantled in a field, workers in safety gear assessing damage. Overcast sky, costly-looking repair operation. Photorealistic, editorial photography style, no text in scene.',
    d: 'A vast solar farm at golden hour, rows of gleaming panels stretching to the horizon. Clean, expansive, optimistic. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'police-brutality',
    word: 'police brutality',
    r: 'A police officer standing calmly at a community event, talking with a local resident. Professional, composed, ordinary interaction. Photorealistic, editorial photography style, no text in scene.',
    d: 'A candlelit vigil on a city sidewalk at night. People standing in silence, some holding framed photographs. Grief, collective mourning. Photorealistic, editorial photography style, no text in scene.'
  },
  {
    slug: 'mass-shooting',
    word: 'mass shooting',
    r: 'A man at an indoor shooting range in ear protection, practicing with a handgun. Safety-conscious, disciplined, legal. Photorealistic, editorial photography style, no text in scene.',
    d: 'A school hallway lined with lockers, a small pile of flowers and a teddy bear placed against the wall beneath a single locker. Empty, still, heavy. Photorealistic, editorial photography style, no text in scene.'
  },
  // {
  //   slug: 'death-penalty',
  //   word: 'death penalty',
  //   r: 'A courtroom scene, a judge\'s gavel resting on the bench, the gallery solemn and still. Order, finality, institutional authority. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A narrow prison cell at dawn, a pair of hands resting on the bars, dim light through a small window. Still, isolated. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'war-on-drugs',
  //   word: 'war on drugs',
  //   r: 'An overcrowded prison dormitory, rows of cots, men in identical uniforms. Institutional, bleak, overwhelming scale. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A counselor and a young man sitting across from each other in a sparse but warm community health clinic room. Quiet conversation, hopeful. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'gun-control',
  //   word: 'gun control',
  //   r: 'A middle-aged man in a flannel shirt cleaning a rifle at his kitchen table, a gun cabinet visible behind him. Routine, responsible, domestic. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A crowd marching down a city street, people holding handmade signs, faces determined and emotional. Daytime protest, urban backdrop. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'drag-queen',
  //   word: 'drag queen',
  //   r: 'A heavily made-up performer in an elaborate costume standing in a school gymnasium, children sitting cross-legged on the floor in front of them. Uncomfortable visual juxtaposition. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A performer in a glittering gown taking a bow on a stage, an enthusiastic adult audience applauding, colorful stage lights. Celebratory, theatrical. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'gender-identity',
  //   word: 'gender identity',
  //   r: 'A concerned parent and a doctor in a clinical office, reviewing a thick folder of documents. Serious, medical, worried tone. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A young person in a colorful outfit laughing with a group of friends in a sunny park. Easy belonging, unselfconscious joy. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'abortion-clinic',
  //   word: 'abortion clinic',
  //   r: 'A small group of people standing on a sidewalk outside a nondescript building, heads bowed in prayer, some holding rosaries. Solemn, moral weight. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A nurse at a reception desk handing a pamphlet to a young woman. Clean, calm medical office, warm lighting. Routine healthcare visit. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'single-mother',
  //   word: 'single mother',
  //   r: 'A woman sitting at a kitchen table late at night, staring at a pile of unpaid bills, an empty coffee cup beside her. Children\'s drawings on the fridge behind her. Isolated, strained. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A woman holding a young child on her hip, standing confidently at a community meeting, other parents around her. Present, engaged, capable. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'white-privilege',
  //   word: 'white privilege',
  //   r: 'A weathered older white man sitting on the porch steps of a run-down house in a rural area, looking tired. Working class, struggling, modest. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'Two people in business attire walking into a gleaming office lobby, one being waved through by security while the other is stopped and questioned. Quiet disparity, institutional setting. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'voter-fraud',
  //   word: 'voter fraud',
  //   r: 'A pile of mail-in ballot envelopes on a table, some opened, an unattended ballot box nearby. Chaotic, unsupervised, suspicious atmosphere. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'An orderly polling station, voters in a quiet line, election workers at tables carefully checking rolls. Calm, civic, procedural. Photorealistic, editorial photography style, no text in scene.'
  // },
  // {
  //   slug: 'cancel-culture',
  //   word: 'cancel culture',
  //   r: 'A person sitting alone at a desk, laptop closed, microphone unplugged beside it, looking out a window at an empty street. Silenced, isolated. Photorealistic, editorial photography style, no text in scene.',
  //   d: 'A community forum, a moderator at a podium, an audience of people with hands raised, open discussion in progress. Accountability, public deliberation. Photorealistic, editorial photography style, no text in scene.'
  // }
]; // _unused_words — kept for reference only

async function generateImage(prompt, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping (already exists): ${path.basename(outputPath)}`);
    return true;
  }

  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('output_format', 'jpeg');
  formData.append('aspect_ratio', '3:2');

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${API_KEY}`,
      accept: 'image/*'
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return true;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const manifest = {};
  let total = 0;
  let failed = [];

  for (const entry of words) {
    console.log(`\n[${++total}/${words.length * 2 - (total - 1)}] ${entry.word}`);
    manifest[entry.slug] = { word: entry.word, r: null, d: null };

    // R image
    const rPath = path.join(OUT_DIR, `${entry.slug}-r.jpg`);
    try {
      console.log(`  Generating R...`);
      await generateImage(entry.r, rPath);
      manifest[entry.slug].r = `/game2/${entry.slug}-r.jpg`;
      console.log(`  ✓ R saved`);
    } catch (e) {
      console.error(`  ✗ R failed: ${e.message}`);
      failed.push({ slug: entry.slug, side: 'r', error: e.message });
    }

    await sleep(1000); // rate limit buffer

    // D image
    const dPath = path.join(OUT_DIR, `${entry.slug}-d.jpg`);
    try {
      console.log(`  Generating D...`);
      await generateImage(entry.d, dPath);
      manifest[entry.slug].d = `/game2/${entry.slug}-d.jpg`;
      console.log(`  ✓ D saved`);
    } catch (e) {
      console.error(`  ✗ D failed: ${e.message}`);
      failed.push({ slug: entry.slug, side: 'd', error: e.message });
    }

    await sleep(1000);
  }

  // Write manifest
  const manifestPath = path.join(__dirname, 'static', 'game2_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written to static/game2_manifest.json`);

  if (failed.length > 0) {
    console.log(`\n⚠ Failed (${failed.length}):`);
    failed.forEach(f => console.log(`  ${f.slug} ${f.side}: ${f.error}`));
  } else {
    console.log('✓ All images generated successfully');
  }
}

main().catch(console.error);

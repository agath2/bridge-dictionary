# Bridging Dictionary — Project Notes

## What this project is

A web game built on the [Bridging Dictionary paper](https://doi.org/10.1145/3678884.3681820) (Jiang, Beeferman, Brannon, Heyward & Roy · CSCW 2024). The paper introduced an AI-generated dictionary of 796 politically charged terms, showing how Republicans and Democrats use the same words differently. This site turns that data into games designed to surface players' own assumptions and biases.

Live at: **https://bridge-dictionary.vercel.app**
GitHub: https://github.com/agath2/bridge-dictionary

---

## Stack

- **SvelteKit** (Svelte 5 runes mode) + **@sveltejs/adapter-vercel**
- Plain JavaScript (no TypeScript)
- No UI library — all styles are component-scoped CSS
- Deployed on **Vercel** via GitHub integration (auto-deploys on push to `main`)
- Node v24, npm v11

---

## Project structure

```
src/
├── lib/
│   └── gameStore.js          # shared Svelte stores: session, results, resetGame()
└── routes/
    ├── +layout.svelte         # root layout (favicon only)
    ├── +page.svelte           # landing page — game selection cards
    └── attribution/
        ├── +page.svelte       # Game 1 intro + session builder
        ├── game/
        │   └── +page.svelte   # Game 1 play loop
        └── summary/
            └── +page.svelte   # Game 1 results + bias insights

static/
└── game1/
    ├── ambiguous_quotes.json      # 25 quotes — hard to attribute by content alone
    └── stereotype_quotes.json     # 25 quotes — clearly signal one political side
```

---

## Data files

Both JSON files live in `static/game1/` and are fetched at runtime via `fetch('/game1/ambiguous_quotes.json')`.

### Quote object shape
```json
{
  "quote": "The actual tweet text",
  "word": "the dictionary headword that appears in the quote",
  "side": "R or D",
  "republican_pct": 47.0,
  "democrat_pct": 53.0,
  "type": "ambiguous or stereotype",
  "note": "One sentence explaining why this quote is ambiguous/obvious — shown on the summary page after a wrong answer"
}
```

### Curation decisions made so far
- Removed any quote containing: `democrat`, `republican`, `democrats`, `republicans`, `dem`, `dems` (party names make attribution trivially easy)
- Removed quotes that are completely apolitical (sports, family banter, literal word meanings) — every quote should have *some* political content
- Ambiguous quotes are ones where the content/framing could plausibly come from either side, or where one side is using the other side's typical language
- Stereotype quotes are ones where the *position itself* (not explicit party labels) makes the side obvious

### Source
The original dictionary HTML (`bridging_dictionary.html`) is in the project root. It contains 796 entries, each with Republican and Democrat usage summaries, example quotes, and usage share percentages. This is the raw material for adding more quotes to either JSON file.

---

## Game 1: Who Said It? (`/attribution`)

### Flow
`/attribution` (intro + Play button) → `/attribution/game` (10 rounds) → `/attribution/summary` (results)

### Session structure
- 5 quotes randomly picked from `game1/stereotype_quotes.json` (shown first)
- 5 quotes randomly picked from `game1/ambiguous_quotes.json` (shown second)
- Total: 10 rounds per session

### Data collected per round
```js
{
  quote,            // full quote object from JSON
  guess,            // "R" or "D"
  correct,          // boolean
  response_time_ms, // time from quote display to button click
  type              // "stereotype" or "ambiguous"
}
```

### Summary page insights (generated from session data)
Three personalized insight sentences, computed in this priority order:
1. **Blind spot side** — if errors skew >60% toward one side
2. **Confident but wrong** — fast answers (< 3000ms) that were incorrect
3. **Stereotype vs ambiguous accuracy gap** — if performance differs significantly between the two types

Wrong answers are shown with the quote, what the player guessed, the correct side, and the `note` field from the JSON.

---

## Design language

- Background: `#0f0f0f` (near black)
- Primary text: `#e8e4dc` (warm off-white)
- Secondary text: `#888` / `#999`
- Accent/gold (highlighted dictionary word): `#d4a853`
- Democrat blue: `#6a9fd8`
- Republican red: `#c0674a`
- Correct feedback: `#7ec87e` on `#2a3d2a`
- Wrong feedback: `#c07e7e` on `#3d2a2a`
- Font: Georgia serif throughout
- Card borders: `1px solid #2a2a2a`, hover to `#888`
- Tone: editorial, calm, not gamified — no scores as primary metric, insights over points

---

## Adding a new game

1. Create `src/routes/<game-name>/` with `+page.svelte`, `game/+page.svelte`, `summary/+page.svelte` (or whatever pages the mechanic needs)
2. Add a new `<a href="/<game-name>">` card to `src/routes/+page.svelte` (replace the "Coming soon" placeholder)
3. The game can reuse `gameStore.js` or create its own store in `src/lib/`
4. Data can be fetched from the existing JSON files or new ones added to `static/`

---

## Other game mechanics considered (not yet built)

- **Usage Share Slider** — show a word, player drags a slider guessing the R/D usage split, reveal the actual percentage
- **Pick the Bridge** — show a word and 4 candidate alternative phrasings, player picks the one that would appeal most equally to both sides
- **Fill the Gap** — show a word, player predicts how each side uses it before seeing the dictionary entry
- **Odd One Out** — show 4 words, 3 heavily skewed to one side and 1 near 50/50, player identifies the balanced one

---

## Deployment

Push to `main` on GitHub → Vercel auto-deploys. No manual steps needed.
The local `npm run build` fails with a symlink error on Windows (EPERM) but this is a Windows-only issue — Vercel builds on Linux and works correctly.

# Charades word pool — removal log

Tracks every headword cut from the full 736-word dictionary during manual curation of `charades_words.json`, and why. Starting count: 736. Current count: 567.

## 1. Platform-specific (X/Twitter)

Terms tied to Twitter/X's own mechanics rather than a general political concept — wouldn't make sense to a player unfamiliar with the platform.

- Black Twitter
- blue checkmark

## 2. Generic idioms / not politically relevant

Common phrases or idioms that got swept into the dictionary by the original text-mining pipeline but aren't actually about a political concept — same standard used to curate the attribution-game quote pools (remove anything apolitical).

ad infinitum, agree to disagree, bingo card, black hat, blanket statement, blow up, boy scout, chill out, code of conduct, come back to bite, control freak, crap on, cray cray, critical mass, cross the line, crunch time, daddy issues, danger zone, dunk on, early retirement, earn a living, exit ramp, faux pas, field day, foul play, freak show, free reign, gave a shit, get up in, good will, grammar police, grand scheme of things, grow a set, gut feeling, have a seat, have no sympathy, hell hole, here and now, high and mighty, high ground, high road, hill to die on, house of cards, human condition, inside job, judgement day, keyboard warrior, law of the land, life savings, life style, logical fallacy, lost in translation, lowest common denominator, magical thinking, man child, modern history, Modern Times, modus operandi, moot point, move the needle, mug shot, narrow minded, nervous breakdown, no longer with us, non sequitur, on the merits, online dating, operative word, out of the question, Palm Beach County, peanut gallery, peer reviewed, personal attack, personal life, pick up the phone, piggy bank, pill to swallow, polar opposite, popular opinion, poster boy, powers that be, prey on, private life, rabbit hole, rallying cry, reality check, reality tv, recycling bin, rude awakening, Russian Roulette, sex life, sex ed, Sex Education, shoulder to shoulder, side eye, smoke and mirrors, snake oil, stand for, status quo, sucker punch, sugar daddy, Sunday School, take action, take responsibility, teachable moment, tell the truth, Ten Commandments, town square, truth bomb, under the influence, unprotected sex, up in arms, village idiot, wag the dog, walk free, walk the walk, way of life, weight gain, wet dream, white flag, white hat, white party (likely a parsing artifact), with a grain of salt

Also from the same pass, borderline cases decided the same way: cat lady, come out of the closet, come to Jesus, insane asylum, left turn, porn star, pussy hat, western world, white girl

Explicitly kept despite matching the "generic idiom" scan: **spiritual warfare**, **God Almighty**

## 3. Clinical/neutral term weaponized as a political insult (not genuine concept disagreement)

These have a real R/D usage gap, but it's specifically about one side using an otherwise-neutral clinical or descriptive term as a personal insult toward political opponents, while the other side uses it in its ordinary literal sense. Judged too likely to fail as a charades word — a player describing the concept would reach for the literal meaning, not the insult usage, so the partisan signal probably wouldn't surface in actual gameplay clues. This is different from a term like "welfare," where the two sides genuinely disagree about the concept itself.

- mental breakdown
- mental hospital
- mental institution
- mental illness
- mentally challenged
- crack head
- crack pipe

## 4. Classist descriptor weaponized as insult (same pattern as #3, flipped valence)

- trailer park — here Democrats use it derogatorily ("uneducated, poor, trashy") while Republicans use it neutrally/positively; same structural issue as #3, just not partisan-symmetric with the rest of that group.

## 5. Ambiguous / dual-meaning (NSFW risk)

- deep throat — genuine dual meaning (Watergate whistleblower reference vs. sexual slang), independent of partisan framing; too confusing/risky as a charades target regardless of political content.
- safe sex — explicitly sexual topic (abstinence-only/sex-ed policy debates); cut on topic-sensitivity grounds rather than ambiguity.

(Checked the remaining 593 words for similar dual-meaning risk — no other matches found. A few hits for profanity inside sourced example quotes, e.g. censorship, fixed income, general public, but that's just quoted tweet language, not the headword itself carrying ambiguity, so those were left in.)

## 6. Duplicate / near-duplicate entries

Redundant singular/plural or spelling variants of a word already in the pool — kept one form, cut the other.

- charter schools (kept: charter school)
- human rights (kept: human right)
- liberal democrats (kept: liberal democrat)
- public transportation (kept: public transport)
- super pacs (kept: super pac)
- tax hikes (kept: tax hike)
- virtue signalling (kept: virtue signal)
- white privileged (kept: white privilege)
- sanctuary cities (kept: sanctuary city)

## 7. Generic non-political terms (second pass)

More idioms/phrases with no real political content, found on a second read-through of the list.

be silent, cash grab, common knowledge, day in court, dead on arrival, fist fight, food chain, make a living, primary source, punching bag, root of all evil, self control

## 8. Niche proper nouns

Specific institutions/brands/places rather than general political concepts.

- Fannie Mae
- Gallup Poll
- New York City
- Gen Xer

## Still open / not yet decided

- **supreme leader** — came up in the same insult-pattern scan as #3, but judged genuinely political (real usage re: Khamenei/Kim Jong-un vs. sarcastic domestic-authoritarianism framing), not a neutral term hijacked — leaning keep.

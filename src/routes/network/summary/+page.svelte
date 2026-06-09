<script>
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { networkResults, resetNetwork } from '$lib/networkStore.js';

  const results = get(networkResults);

  if (results.length === 0) {
    goto('/network');
  }

  // ── Overall reader type ───────────────────────────────────────────────────
  let totalAffect = 0, totalContext = 0;

  for (const r of results) {
    for (const w of r.clicked) {
      const sw = r.satellite_words.find(s => s.word === w);
      if (!sw) continue;
      if (sw.type === 'affect') totalAffect++;
      else totalContext++;
    }
  }

  const totalClicks = totalAffect + totalContext;

  let readerType, readerExplainer;
  if (totalClicks === 0) {
    readerType = 'The Quiet Observer';
    readerExplainer = "You didn't connect strongly with many of these words — or you were being careful. Either way, your associations were sparse.";
  } else {
    const affectRatio = totalAffect / totalClicks;
    if (affectRatio >= 0.6) {
      readerType = 'The Headline Reader';
      readerExplainer = "You tend to process political language through emotion and feeling — gut reactions, moral weight, threat or hope. Your word web is built from affect.";
    } else if (affectRatio <= 0.4) {
      readerType = 'The Policy Reader';
      readerExplainer = "You tend to process political language through context and structure — institutions, facts, mechanisms. Your word web is built from frameworks, not feelings.";
    } else {
      readerType = 'The Balanced Reader';
      readerExplainer = "You draw from both emotional and contextual associations roughly equally. You move between feeling and framing when you encounter political language.";
    }
  }

  // ── Per-word lean ─────────────────────────────────────────────────────────
  function computeLean(result) {
    let rCount = 0, dCount = 0;
    for (const w of result.clicked) {
      const sw = result.satellite_words.find(s => s.word === w);
      if (!sw) continue;
      if (sw.lean === 'R') rCount++;
      else if (sw.lean === 'D') dCount++;
    }
    if (rCount === 0 && dCount === 0) return { lean: 'none', rCount, dCount };
    if (rCount > dCount) return { lean: 'R', rCount, dCount };
    if (dCount > rCount) return { lean: 'D', rCount, dCount };
    return { lean: 'balanced', rCount, dCount };
  }

  const wordReports = results.map(r => ({ ...r, ...computeLean(r) }));

  function leanLabel(lean) {
    if (lean === 'R') return 'leans Republican';
    if (lean === 'D') return 'leans Democrat';
    if (lean === 'balanced') return 'is balanced';
    return 'is hard to read';
  }

  function leanColor(lean) {
    if (lean === 'R') return '#c0674a';
    if (lean === 'D') return '#6a9fd8';
    return '#888';
  }

  function playAgain() {
    resetNetwork();
    goto('/network');
  }
</script>

<svelte:head>
  <title>Your Word Web — Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/">← All games</a></p>

    <!-- Overall profile -->
    <section class="profile">
      <div class="profile-label">Your reader type</div>
      <h1 class="profile-type">{readerType}</h1>
      <p class="profile-explainer">{readerExplainer}</p>

      {#if totalClicks > 0}
        <div class="bar-row">
          <span class="bar-label">Emotional</span>
          <div class="bar-track">
            <div
              class="bar-fill bar-affect"
              style="width: {Math.round((totalAffect / totalClicks) * 100)}%"
            ></div>
          </div>
          <span class="bar-label">Contextual</span>
        </div>
        <p class="bar-note">{totalAffect} emotional · {totalContext} contextual out of {totalClicks} clicks</p>
      {/if}
    </section>

    <hr class="divider" />

    <!-- Per-word breakdown -->
    <section class="words-section">
      <h2 class="section-heading">Word by word</h2>

      {#each wordReports as r}
        <div class="word-block">
          <div class="word-heading-row">
            <span class="word-term">{r.headword}</span>
            <span class="word-lean" style="color: {leanColor(r.lean)}">
              Your web {leanLabel(r.lean)}
            </span>
          </div>

          {#if r.lean !== 'none'}
            <p class="frame-compare">
              <span class="frame-r">Republicans</span> frame this around {r.r_frame}.
              <span class="frame-d">Democrats</span> frame it around {r.d_frame}.
            </p>
          {:else}
            <p class="frame-compare muted">You didn't select words for this one.</p>
          {/if}

          <!-- Satellite word chips, showing what was clicked -->
          <div class="chips">
            {#each r.satellite_words as sw}
              <span
                class="chip"
                class:chip-clicked={r.clicked.includes(sw.word)}
                class:chip-r={r.clicked.includes(sw.word) && sw.lean === 'R'}
                class:chip-d={r.clicked.includes(sw.word) && sw.lean === 'D'}
              >
                {sw.word}
              </span>
            {/each}
          </div>
        </div>
      {/each}
    </section>

    <div class="actions">
      <button class="play-btn" onclick={playAgain}>Play again →</button>
      <a href="/" class="home-link">All games</a>
    </div>
  </div>
</main>

<style>
  :global(body) {
    background: #0f0f0f;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    min-height: 100vh;
  }

  main {
    padding: 3rem 2rem;
    display: flex;
    justify-content: center;
  }

  .container {
    max-width: 600px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .back a {
    font-size: 0.85rem;
    color: #666;
    text-decoration: none;
  }
  .back a:hover { color: #e8e4dc; }

  /* Profile */
  .profile {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .profile-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #666;
  }

  .profile-type {
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: normal;
    color: #d4a853;
    line-height: 1.1;
  }

  .profile-explainer {
    font-size: 1rem;
    line-height: 1.7;
    color: #c8c4bc;
    max-width: 480px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 0.4rem;
  }

  .bar-label {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
  }

  .bar-track {
    flex: 1;
    height: 4px;
    background: #2a2a2a;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    transition: width 0.6s ease;
  }

  .bar-affect { background: #d4a853; }

  .bar-note {
    font-size: 0.78rem;
    color: #555;
    font-style: italic;
  }

  .divider {
    border: none;
    border-top: 1px solid #1e1e1e;
  }

  /* Per-word */
  .section-heading {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #666;
    font-weight: normal;
    margin-bottom: 0.5rem;
  }

  .words-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .word-block {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .word-heading-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .word-term {
    font-size: 1.2rem;
    color: #e8e4dc;
  }

  .word-lean {
    font-size: 0.82rem;
    font-style: italic;
  }

  .frame-compare {
    font-size: 0.88rem;
    line-height: 1.6;
    color: #888;
  }

  .frame-compare.muted { color: #555; font-style: italic; }

  .frame-r { color: #c0674a; }
  .frame-d { color: #6a9fd8; }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chip {
    font-size: 0.78rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid #222;
    color: #444;
  }

  .chip-clicked {
    border-color: #555;
    color: #c8c4bc;
  }

  .chip-r {
    border-color: rgba(192, 103, 74, 0.5);
    color: #c0674a;
  }

  .chip-d {
    border-color: rgba(106, 159, 216, 0.5);
    color: #6a9fd8;
  }

  /* Actions */
  .actions {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding-top: 1rem;
  }

  .play-btn {
    background: none;
    border: 1px solid #888;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.7rem 1.6rem;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition: border-color 0.15s, color 0.15s;
  }
  .play-btn:hover {
    border-color: #e8e4dc;
    color: #fff;
  }

  .home-link {
    font-size: 0.88rem;
    color: #666;
    text-decoration: none;
  }
  .home-link:hover { color: #e8e4dc; }
</style>

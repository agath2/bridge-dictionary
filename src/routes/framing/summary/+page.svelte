<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { framingResults, resetFramingGame } from '$lib/framingStore.js';
  import { politicalAffiliation } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let allResults = get(framingResults);

  if (browser && allResults.length === 0) {
    goto('/framing');
  }

  onMount(() => {
    if (allResults.length === 0) return;

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game: 'framing',
        affiliation: get(politicalAffiliation),
        session_data: allResults
      })
    });
  });

  const total = allResults.length;
  const rCount = allResults.filter(r => r.chosen_side === 'R').length;
  const dCount = allResults.filter(r => r.chosen_side === 'D').length;
  const rPct = Math.round((rCount / total) * 100);
  const dPct = 100 - rPct;

  const FAST_MS = 2500;
  const fastPicks = allResults.filter(r => r.response_time_ms < FAST_MS);
  const fastR = fastPicks.filter(r => r.chosen_side === 'R').length;
  const fastD = fastPicks.filter(r => r.chosen_side === 'D').length;

  // ── Insights ─────────────────────────────────────────────────────────────────

  let insights = [];

  // 1. Overall lean
  if (rPct >= 75) {
    insights.push(`You gravitated toward the <strong>Republican framing</strong> across most of these words — ${rPct}% of your picks matched how Republicans tend to picture these concepts.`);
  } else if (dPct >= 75) {
    insights.push(`You gravitated toward the <strong>Democrat framing</strong> across most of these words — ${dPct}% of your picks matched how Democrats tend to picture these concepts.`);
  } else if (rPct >= 55) {
    insights.push(`You leaned slightly toward the <strong>Republican framing</strong> (${rPct}% of picks), but your instincts were genuinely mixed — no strong pull in either direction.`);
  } else if (dPct >= 55) {
    insights.push(`You leaned slightly toward the <strong>Democrat framing</strong> (${dPct}% of picks), but your instincts were genuinely mixed — no strong pull in either direction.`);
  } else {
    insights.push(`Your picks were almost evenly split — ${rPct}% Republican framing, ${dPct}% Democrat framing. You didn't default to either side's way of seeing these concepts.`);
  }

  // 2. Fast picks lean
  if (fastPicks.length >= 3) {
    if (fastR > fastD && fastR >= 2) {
      insights.push(`Your fastest instinctive picks tended toward the <strong>Republican framing</strong>. Speed reveals what you reach for before you have time to deliberate.`);
    } else if (fastD > fastR && fastD >= 2) {
      insights.push(`Your fastest instinctive picks tended toward the <strong>Democrat framing</strong>. Speed reveals what you reach for before you have time to deliberate.`);
    }
  }

  // 3. Reminder
  insights.push(`These images were generated from the language each political group actually uses to discuss these words — not from stereotypes. What you chose reflects which framing already lives in your mental image of these concepts.`);

  function playAgain() {
    resetFramingGame();
    goto('/framing');
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Your Framing</title>
</svelte:head>

<main>
  <div class="container">

    <!-- Score bar -->
    <div class="score-section">
      <p class="score-label">Your visual lean</p>
      <div class="bar-wrap">
        <div class="bar-segment republican" style="width: {rPct}%">
          {#if rPct >= 20}<span>{rPct}%</span>{/if}
        </div>
        <div class="bar-segment democrat" style="width: {dPct}%">
          {#if dPct >= 20}<span>{dPct}%</span>{/if}
        </div>
      </div>
      <div class="bar-labels">
        <span class="label-r">Republican framing</span>
        <span class="label-d">Democrat framing</span>
      </div>
    </div>

    <!-- Insights -->
    <div class="insights-section">
      {#each insights as insight}
        <p class="insight">{@html insight}</p>
      {/each}
    </div>

    <!-- Round-by-round review -->
    <div class="review-section">
      <h2 class="review-title">Your choices, revealed</h2>
      <div class="review-grid">
        {#each allResults as r}
          <div class="review-item">
            <p class="review-word">{r.word}</p>
            <div class="review-images">
              <div class="review-img-wrap" class:chosen={true} class:republican={r.chosen_side === 'R'} class:democrat={r.chosen_side === 'D'}>
                <img src={r.chosen_side === 'R' ? r.r_image : r.d_image} alt="Your pick for {r.word}" />
                <span class="img-label chosen-label">
                  Your pick · {r.chosen_side === 'R' ? 'Republican framing' : 'Democrat framing'}
                </span>
              </div>
              <div class="review-img-wrap other">
                <img src={r.chosen_side === 'R' ? r.d_image : r.r_image} alt="Other framing for {r.word}" />
                <span class="img-label other-label">
                  {r.chosen_side === 'R' ? 'Democrat framing' : 'Republican framing'}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="play-btn" onclick={playAgain}>Play again</button>
      <a href="/dev/landing" class="back-link">← All games</a>
    </div>

  </div>
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: #0f0f0f;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    min-height: 100vh;
  }

  main {
    padding: 3rem 2rem 5rem;
  }

  .container {
    max-width: 680px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
  }

  /* Score bar */
  .score-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .score-label {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .bar-wrap {
    display: flex;
    height: 2.5rem;
    border-radius: 2px;
    overflow: hidden;
    gap: 2px;
  }

  .bar-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.04em;
    transition: width 0.6s ease;
    min-width: 0;
  }

  .bar-segment.republican {
    background: #c0674a;
    color: #fff;
  }

  .bar-segment.democrat {
    background: #6a9fd8;
    color: #fff;
  }

  .bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: #666;
    letter-spacing: 0.04em;
  }

  .label-r { color: #c0674a; }
  .label-d { color: #6a9fd8; }

  /* Insights */
  .insights-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-left: 2px solid #2a2a2a;
    padding-left: 1.2rem;
  }

  .insight {
    font-size: 1.05rem;
    line-height: 1.7;
    color: #c8c4bc;
  }

  /* Review grid */
  .review-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .review-title {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    font-weight: normal;
  }

  .review-grid {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .review-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid #1e1e1e;
  }

  .review-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .review-word {
    font-size: 1.1rem;
    color: #d4a853;
    letter-spacing: 0.02em;
  }

  .review-images {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .review-img-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .review-img-wrap img {
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    border-radius: 2px;
    border: 2px solid transparent;
  }

  .review-img-wrap.chosen.republican img { border-color: #c0674a; }
  .review-img-wrap.chosen.democrat  img { border-color: #6a9fd8; }
  .review-img-wrap.other img             { opacity: 0.45; }

  .img-label {
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .chosen-label { color: #d4a853; }
  .other-label  { color: #444; }

  /* Actions */
  .actions {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .play-btn {
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    padding: 0.9rem 2rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }

  .play-btn:hover {
    background: #ffffff;
    transform: translateY(-1px);
  }

  .back-link {
    font-size: 0.9rem;
    color: #b8a98a;
    text-decoration: none;
    letter-spacing: 0.02em;
  }

  .back-link:hover { text-decoration: underline; }

  @media (max-width: 480px) {
    .review-images {
      grid-template-columns: 1fr;
    }
  }
</style>

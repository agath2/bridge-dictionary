<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { results, resetGame, politicalAffiliation } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let allResults = get(results);

  if (allResults.length === 0) {
    goto('/attribution');
  }

  onMount(() => {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game: 'attribution',
        affiliation: get(politicalAffiliation),
        session_data: allResults.map(r => ({
          word: r.word.word,
          guess: r.guess,
          correct: r.correct,
          response_time_ms: r.response_time_ms,
          type: r.type
        }))
      })
    });
  });

  const HESITATION_THRESHOLD_MS = 3000;

  // ── Core stats ──────────────────────────────────────────────────────────────

  const total = allResults.length;
  const correct = allResults.filter(r => r.correct).length;
  const wrong = allResults.filter(r => !r.correct);

  // Majority side helper
  function majoritySide(item) {
    return item.republican_pct >= item.democrat_pct ? 'R' : 'D';
  }

  // ── Blind spot analysis ──────────────────────────────────────────────────────
  const missedR = wrong.filter(r => majoritySide(r.word) === 'R').length;
  const missedD = wrong.filter(r => majoritySide(r.word) === 'D').length;

  // ── Confidence analysis ──────────────────────────────────────────────────────
  const fastWrong = wrong.filter(r => r.response_time_ms < HESITATION_THRESHOLD_MS);

  // ── Ambiguous vs stereotype accuracy ────────────────────────────────────────
  const stereoResults = allResults.filter(r => r.type === 'stereotype');
  const ambigResults  = allResults.filter(r => r.type === 'ambiguous');
  const stereoCorrect = stereoResults.filter(r => r.correct).length;
  const ambigCorrect  = ambigResults.filter(r => r.correct).length;
  const stereoPct = stereoResults.length ? Math.round((stereoCorrect / stereoResults.length) * 100) : null;
  const ambigPct  = ambigResults.length  ? Math.round((ambigCorrect  / ambigResults.length)  * 100) : null;

  // ── Generate personalized insight sentences ──────────────────────────────────

  let insights = [];

  // 1. Blind spot side
  if (wrong.length >= 2) {
    if (missedR > missedD && missedR >= 2) {
      insights.push(`You tended to underestimate <strong>Republican</strong> usage — when you were wrong, it was usually a word Republicans use more than you expected.`);
    } else if (missedD > missedR && missedD >= 2) {
      insights.push(`You tended to underestimate <strong>Democrat</strong> usage — when you were wrong, it was usually a word Democrats lean on more than you expected.`);
    } else if (missedR === missedD && wrong.length >= 2) {
      insights.push(`Your errors were <strong>evenly split</strong> between both sides — you weren't systematically off in one direction.`);
    }
  }

  // 2. Fast but wrong (confident mistakes)
  if (fastWrong.length >= 1) {
    const example = fastWrong[0].word.word;
    if (fastWrong.length === 1) {
      insights.push(`Your quickest answer was also wrong — you moved fast on <em>"${example}"</em>. Speed here usually signals a confident assumption.`);
    } else {
      insights.push(`${fastWrong.length} of your wrong answers came quickly — including <em>"${example}"</em>. Fast and wrong usually means a confident assumption that didn't hold.`);
    }
  }

  // 3. Ambiguous vs stereotype performance
  if (stereoPct !== null && ambigPct !== null) {
    const diff = stereoPct - ambigPct;
    if (diff >= 30) {
      insights.push(`You nailed the skewed words (${stereoPct}% correct) but the close-split ones tripped you up (${ambigPct}% correct). The words near 50/50 are the interesting ones — neither side has a clear claim.`);
    } else if (diff <= -10) {
      insights.push(`You did <em>better</em> on the close-split words (${ambigPct}%) than the obviously skewed ones (${stereoPct}%). You may be more attuned to nuance than to stereotypes.`);
    } else if (ambigPct >= 60) {
      insights.push(`You handled the close-split words well (${ambigPct}% correct) — those are the ones most people find hardest.`);
    }
  }

  // Fallback
  if (insights.length === 0) {
    insights.push(`Every percentage in this game comes from real usage data collected during the 2020 US election. The words that surprised you are worth sitting with.`);
  }

  // ── Play again ───────────────────────────────────────────────────────────────
  function playAgain() {
    resetGame();
    goto('/attribution');
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Results</title>
</svelte:head>

<main>
  <div class="container">

    <!-- Score -->
    <div class="score-section">
      <p class="score-label">You got</p>
      <p class="score-number">{correct} <span class="score-denom">/ {total}</span></p>
      <p class="score-subtext">
        {#if correct === total}
          All correct. But here's what's more interesting:
        {:else if correct >= total * 0.7}
          Mostly correct. But here's what's more interesting:
        {:else}
          Here's what your answers reveal about you:
        {/if}
      </p>
    </div>

    <!-- Personalized insights -->
    <div class="insights-section">
      {#each insights as insight}
        <p class="insight">{@html insight}</p>
      {/each}
    </div>

    <!-- All words review -->
    <div class="review-section">
      <h2 class="review-title">All words</h2>
      <div class="review-list">
        {#each allResults as r}
          {@const side = majoritySide(r.word)}
          <div class="review-item">
            <div class="review-header">
              <p class="review-word">{r.word.word}</p>
              {#if !r.correct}
                <span class="missed-tag">missed</span>
              {/if}
            </div>
            <div class="review-meta">
              <span class="review-guess" class:wrong-guess={!r.correct} class:right-guess={r.correct}>
                You said: {r.guess === 'R' ? 'Republican' : 'Democrat'}
              </span>
            </div>
            <div class="review-bars">
              <div class="bar-row">
                <span class="bar-label republican-label">Rep</span>
                <div class="bar-track">
                  <div class="bar-fill republican-fill" style="width: {r.word.republican_pct}%"></div>
                </div>
                <span class="bar-pct">{r.word.republican_pct.toFixed(0)}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-label democrat-label">Dem</span>
                <div class="bar-track">
                  <div class="bar-fill democrat-fill" style="width: {r.word.democrat_pct}%"></div>
                </div>
                <span class="bar-pct">{r.word.democrat_pct.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="play-btn" onclick={playAgain}>Play again</button>
      <a href="/" class="back-link">← All games</a>
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
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
  }

  /* Score */
  .score-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .score-label {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .score-number {
    font-size: clamp(3rem, 10vw, 5rem);
    font-weight: normal;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #e8e4dc;
  }

  .score-denom {
    font-size: 0.45em;
    color: #888;
    letter-spacing: 0;
  }

  .score-subtext {
    font-size: 1rem;
    color: #888;
    font-style: italic;
    margin-top: 0.25rem;
  }

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

  /* Wrong answers */
  .review-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .review-title {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    font-weight: normal;
  }

  .review-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .review-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #1e1e1e;
  }

  .review-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .review-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .review-word {
    font-size: 1.4rem;
    color: #d4a853;
    letter-spacing: 0.02em;
  }

  .missed-tag {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c07e7e;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
  }

  .wrong-guess { color: #c0674a; }
  .right-guess { color: #7ec87e; }

  .review-bars {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .bar-label {
    font-size: 0.75rem;
    width: 28px;
    flex-shrink: 0;
    letter-spacing: 0.03em;
  }

  .republican-label { color: #c0674a; }
  .democrat-label { color: #6a9fd8; }

  .bar-track {
    flex: 1;
    height: 5px;
    background: #2a2a2a;
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
  }

  .republican-fill { background: #c0674a; }
  .democrat-fill { background: #6a9fd8; }

  .bar-pct {
    font-size: 0.75rem;
    color: #888;
    width: 34px;
    text-align: right;
    font-family: 'Courier New', monospace;
  }

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
</style>

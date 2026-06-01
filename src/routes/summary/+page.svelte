<script>
  import { goto } from '$app/navigation';
  import { results, resetGame } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let allResults = get(results);

  // Redirect home if someone lands here directly
  if (allResults.length === 0) {
    goto('/');
  }

  const HESITATION_THRESHOLD_MS = 3000;

  // ── Core stats ──────────────────────────────────────────────────────────────

  const total = allResults.length;
  const correct = allResults.filter(r => r.correct).length;
  const wrong = allResults.filter(r => !r.correct);

  // ── Blind spot analysis ──────────────────────────────────────────────────────
  // Among wrong answers, which side did the player mis-attribute most?
  // i.e. they guessed R but it was D, or guessed D but it was R
  const missedR = wrong.filter(r => r.quote.side === 'R').length; // was R, got wrong
  const missedD = wrong.filter(r => r.quote.side === 'D').length; // was D, got wrong

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
      insights.push(`You tended to misread <strong>Republican</strong> voices — when you were wrong, it was usually a Republican you took for a Democrat.`);
    } else if (missedD > missedR && missedD >= 2) {
      insights.push(`You tended to misread <strong>Democrat</strong> voices — when you were wrong, it was usually a Democrat you took for a Republican.`);
    } else if (missedR === missedD && wrong.length >= 2) {
      insights.push(`Your errors were <strong>evenly split</strong> between both sides — you weren't systematically fooled by one more than the other.`);
    }
  }

  // 2. Fast but wrong (confident mistakes)
  if (fastWrong.length >= 1) {
    const example = fastWrong[0].quote.word;
    if (fastWrong.length === 1) {
      insights.push(`Your quickest answer was also wrong — you moved fast on <em>"${example}"</em>. Speed can be a sign of a strong assumption.`);
    } else {
      insights.push(`${fastWrong.length} of your wrong answers came quickly — including <em>"${example}"</em>. Fast and wrong usually means a confident assumption that didn't hold.`);
    }
  }

  // 3. Ambiguous vs stereotype performance
  if (stereoPct !== null && ambigPct !== null) {
    const diff = stereoPct - ambigPct;
    if (diff >= 30) {
      insights.push(`You read the obvious ones well (${stereoPct}% correct) but the subtle quotes caught you off guard (${ambigPct}% correct). The gap between those two numbers is where the real biases live.`);
    } else if (diff <= -10) {
      insights.push(`Interestingly, you did <em>better</em> on the subtle quotes (${ambigPct}%) than the obvious ones (${stereoPct}%). You may be better at reading nuance than stereotypes.`);
    } else if (ambigPct >= 60) {
      insights.push(`You handled the ambiguous quotes well (${ambigPct}% correct) — those are the ones most people struggle with.`);
    }
  }

  // Fallback if not enough data for any insight
  if (insights.length === 0) {
    insights.push(`Every quote in this game came from a real person. The ones that surprised you most are worth sitting with.`);
  }

  // ── Play again ───────────────────────────────────────────────────────────────
  function playAgain() {
    resetGame();
    goto('/');
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

    <!-- Wrong answers review -->
    {#if wrong.length > 0}
      <div class="review-section">
        <h2 class="review-title">The quotes that fooled you</h2>
        <div class="review-list">
          {#each wrong as r}
            <div class="review-item">
              <p class="review-quote">"{r.quote.quote}"</p>
              <div class="review-meta">
                <span class="review-guess wrong-guess">You said: {r.guess === 'R' ? 'Republican' : 'Democrat'}</span>
                <span class="review-divider">·</span>
                <span class="review-actual">Actually: {r.quote.side === 'R' ? 'Republican' : 'Democrat'}</span>
              </div>
              <p class="review-note">{r.quote.note}</p>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="review-section">
        <p class="perfect-note">
          You got everything right this round — try again for a different set of quotes.
        </p>
      </div>
    {/if}

    <!-- Actions -->
    <div class="actions">
      <button class="play-btn" onclick={playAgain}>Play again</button>
      <a
        href="https://dictionary.ccc-mit.org/"
        target="_blank"
        rel="noopener"
        class="dict-link"
      >
        Explore the full Bridging Dictionary →
      </a>
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
    gap: 0.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #1e1e1e;
  }

  .review-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .review-quote {
    font-size: 1rem;
    line-height: 1.65;
    font-style: italic;
    color: #e8e4dc;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
  }

  .wrong-guess {
    color: #c0674a;
  }

  .review-divider {
    color: #444;
  }

  .review-actual {
    color: #7ec87e;
  }

  .review-note {
    font-size: 0.88rem;
    color: #888;
    line-height: 1.6;
    margin-top: 0.25rem;
    font-style: italic;
  }

  .perfect-note {
    font-size: 1rem;
    color: #888;
    font-style: italic;
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

  .dict-link {
    font-size: 0.9rem;
    color: #b8a98a;
    text-decoration: none;
    letter-spacing: 0.02em;
  }

  .dict-link:hover {
    text-decoration: underline;
  }
</style>

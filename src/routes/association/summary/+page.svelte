<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { associationResults } from '$lib/associationStore.js';
  import { results, politicalAffiliation, eligibleForRecording, sessionId } from '$lib/gameStore.js';

  const associationData = get(associationResults);
  const attributionData = get(results);

  if (browser && associationData.length === 0) {
    goto('/association');
  }

  onMount(async () => {
    if (associationData.length === 0) return;
    if (!get(eligibleForRecording)) return;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'association',
          affiliation: get(politicalAffiliation),
          session_id: get(sessionId),
          eligible: true,
          session_data: associationData.map(r => ({ headword: r.headword, words: r.words }))
        })
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('submit failed', res.status, body);
      }
    } catch (e) {
      console.error('submit error', e);
    }
  });

  // ── Attribution recap (simplified: one headline insight, no per-word breakdown) ──

  const HESITATION_THRESHOLD_MS = 3000;

  const hasAttribution = attributionData.length > 0;
  const total = attributionData.length;
  const correct = attributionData.filter(r => r.correct).length;
  const wrong = attributionData.filter(r => !r.correct);

  function majoritySide(item) {
    return item.republican_pct >= item.democrat_pct ? 'R' : 'D';
  }

  const missedR = wrong.filter(r => majoritySide(r.word) === 'R').length;
  const missedD = wrong.filter(r => majoritySide(r.word) === 'D').length;
  const fastWrong = wrong.filter(r => r.response_time_ms < HESITATION_THRESHOLD_MS);

  const stereoResults = attributionData.filter(r => r.type === 'stereotype');
  const ambigResults  = attributionData.filter(r => r.type === 'ambiguous');
  const stereoCorrect = stereoResults.filter(r => r.correct).length;
  const ambigCorrect  = ambigResults.filter(r => r.correct).length;
  const stereoPct = stereoResults.length ? Math.round((stereoCorrect / stereoResults.length) * 100) : null;
  const ambigPct  = ambigResults.length  ? Math.round((ambigCorrect  / ambigResults.length)  * 100) : null;

  let insight = null;

  if (wrong.length >= 2 && missedR > missedD && missedR >= 2) {
    insight = `You tended to underestimate <strong>Republican</strong> usage — when you were wrong, it was usually a word Republicans use more than you expected.`;
  } else if (wrong.length >= 2 && missedD > missedR && missedD >= 2) {
    insight = `You tended to underestimate <strong>Democrat</strong> usage — when you were wrong, it was usually a word Democrats lean on more than you expected.`;
  } else if (wrong.length >= 2 && missedR === missedD) {
    insight = `Your errors were <strong>evenly split</strong> between both sides — you weren't systematically off in one direction.`;
  } else if (fastWrong.length >= 1) {
    const example = fastWrong[0].word.word;
    insight = `Your quickest answer was also wrong — you moved fast on <em>"${example}"</em>. Speed here usually signals a confident assumption.`;
  } else if (stereoPct !== null && ambigPct !== null && stereoPct - ambigPct >= 30) {
    insight = `You nailed the skewed words (${stereoPct}% correct) but the close-split ones tripped you up (${ambigPct}% correct).`;
  } else if (stereoPct !== null && ambigPct !== null && stereoPct - ambigPct <= -10) {
    insight = `You did <em>better</em> on the close-split words (${ambigPct}%) than the obviously skewed ones (${stereoPct}%).`;
  } else if (ambigPct !== null && ambigPct >= 60) {
    insight = `You handled the close-split words well (${ambigPct}% correct) — those are the ones most people find hardest.`;
  } else {
    insight = `Every percentage in this game comes from real usage data. The words that surprised you are worth sitting with.`;
  }

</script>

<svelte:head>
  <title>Bridging Dictionary · Results</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="page">
    <div class="content">
      <p class="eyebrow">your results</p>
      <h1>Session complete</h1>

      {#if hasAttribution}
        <div class="card">
          <p class="card-label">Which side says it more?</p>
          <p class="score">{correct} <span class="score-denom">/ {total}</span></p>
          <p class="insight">{@html insight}</p>
        </div>
      {/if}

      <div class="card">
        <p class="card-label">Free association</p>
        <div class="association-list">
          {#each associationData as r}
            <div class="association-block">
              <span class="headword">{r.headword}</span>
              <div class="word-chips">
                {#each r.words as word}
                  <span class="chip">{word}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="actions">
        <a class="continue-btn" href="/">
          Return to home page
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M13 6l6 6-6 6"/>
          </svg>
        </a>
        <a class="research-link" href="https://doi.org/10.1145/3678884.3681820" target="_blank" rel="noopener noreferrer">
          See relevant research ↗
        </a>
      </div>
    </div>
  </div>
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(body) {
    margin: 0;
    background: #06090c;
  }

  main {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 20%, #10161f 0%, #06090c 60%);
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    display: flex;
    justify-content: center;
    padding: 48px 24px 80px;
    box-sizing: border-box;
  }

  .page {
    width: 100%;
    max-width: 640px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .eyebrow {
    font-size: 15px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  h1 {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 40px;
    font-weight: 500;
    color: #e8e2d0;
    margin-top: 0;
    margin-bottom: 20px;
    line-height: 1.15;
  }

  .card {
    background: linear-gradient(220deg, rgba(126, 141, 154, 0.16) 5%, rgba(0, 5, 39, 0.16) 55%);
    border-radius: 20px;
    padding: 28px 32px;
    box-sizing: border-box;
    box-shadow: 5px 5px 15px 0 rgba(113, 127, 175, 0.16);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .card-label {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  .score {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 48px;
    font-weight: 500;
    color: hsl(43, 100%, 79%);
    line-height: 1;
    margin: 0;
  }

  .score-denom {
    font-size: 0.5em;
    color: #a3b0bd;
  }

  .insight {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #d6dde3;
    margin: 0;
  }

  .association-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .association-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .headword {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 18px;
    color: hsl(43, 100%, 79%);
  }

  .word-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 999px;
    color: #d6dde3;
    background: rgba(240, 223, 160, 0.08);
    border: 1px solid rgba(240, 223, 160, 0.2);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .continue-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    background: hsl(43, 100%, 79%);
    color: #14201c;
    border: none;
    padding: 16px 25px;
    font-size: 18px;
    letter-spacing: .03em;
    cursor: pointer;
    border-radius: 2px;
    text-decoration: none;
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 8px 36px rgba(201,161,59,.35);
    transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }

  .research-link {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 14px;
    color: #a3b0bd;
    text-decoration: none;
  }
  .research-link:hover {
    color: #e8e2d0;
    text-decoration: underline;
  }

  .continue-btn:hover {
    transform: translateY(-2px);
  }
  .continue-btn:active {
    transform: translateY(0);
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 4px 16px rgba(201,161,59,.35);
  }
</style>

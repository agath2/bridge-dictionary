<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { charadesWord, charadesHistory, charadesStatus, resetCharades } from '$lib/charadesStore.js';
  import { politicalAffiliation } from '$lib/gameStore.js';

  const word = get(charadesWord);
  const history = get(charadesHistory);
  const status = get(charadesStatus);

  if (browser && !word) {
    goto('/charades');
  }

  const rounds = history.length;
  const correct = status === 'correct';

  onMount(() => {
    if (!word) return;

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game: 'charades',
        affiliation: get(politicalAffiliation),
        session_data: {
          word: word.headword,
          status,
          rounds,
          history
        }
      })
    });
  });

  function playAgain() {
    resetCharades();
    goto('/charades');
  }
</script>

<svelte:head>
  <title>Charades — Bridging Dictionary</title>
</svelte:head>

{#if word}
  <main>
    <div class="container">
      <p class="back"><a href="/dev/landing">← All games</a></p>

      <div class="heading">
        <p class="eyebrow">{correct ? `Correct in ${rounds} ${rounds === 1 ? 'round' : 'rounds'}` : `Gave up after ${rounds} ${rounds === 1 ? 'round' : 'rounds'}`}</p>
        <h1>{word.headword}</h1>
        <p class="sub">
          {correct
            ? "The AI got it. Here's how each side actually uses this word."
            : "Here's how each side actually uses this word — compare it to how you described it."}
        </p>
      </div>

      <div class="usage-bar">
        <span class="pct r">{word.republican_pct}% Republican</span>
        <div class="bar">
          <div class="bar-fill r" style="width: {word.republican_pct}%"></div>
        </div>
        <span class="pct d">{word.democrat_pct}% Democrat</span>
      </div>

      <div class="definitions">
        <div class="def-block">
          <div class="def-label r-label">Republicans use it to mean…</div>
          <p class="def-text">{word.republican_text}</p>
        </div>
        <div class="def-block">
          <div class="def-label d-label">Democrats use it to mean…</div>
          <p class="def-text">{word.democrat_text}</p>
        </div>
      </div>

      {#if word.alternatives?.length}
        <div class="alternatives">
          <span class="alt-label">Bridging alternatives</span>
          <div class="alt-chips">
            {#each word.alternatives as alt}
              <span class="chip">{alt}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if history.length > 0}
        <div class="your-clues">
          <div class="clues-label">Your clues</div>
          {#each history as round, i}
            <div class="clue-row">
              <span class="round-num">{i + 1}</span>
              <span class="clue-text">{round.clue}</span>
            </div>
          {/each}
        </div>
      {/if}

      <div class="actions">
        <button class="play-btn" onclick={playAgain}>Play again</button>
        <a href="/dev/landing" class="home-link">← All games</a>
      </div>
    </div>
  </main>
{/if}

<style>
  :global(body) {
    background: #0f0f0f;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    min-height: 100vh;
    overflow-y: auto;
  }

  main {
    padding: 3rem 2rem 5rem;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .back a {
    font-size: 0.85rem;
    color: #666;
    text-decoration: none;
  }
  .back a:hover { color: #e8e4dc; }

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #666;
  }

  h1 {
    font-size: clamp(1.8rem, 5vw, 2.4rem);
    font-weight: normal;
    color: #d4a853;
  }

  .sub {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #888;
    max-width: 440px;
  }

  /* Usage bar */
  .usage-bar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .bar {
    height: 4px;
    background: #1e1e1e;
    width: 100%;
  }

  .bar-fill.r {
    height: 100%;
    background: #c0674a;
  }

  .pct {
    font-size: 0.78rem;
    letter-spacing: 0.06em;
  }
  .pct.r { color: #c0674a; }
  .pct.d { color: #6a9fd8; }

  /* Definitions */
  .definitions {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
  }

  .def-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 1.8rem;
    border-bottom: 1px solid #1a1a1a;
  }
  .def-block:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .def-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .r-label { color: #c0674a; }
  .d-label { color: #6a9fd8; }

  .def-text {
    font-size: 0.92rem;
    line-height: 1.7;
    color: #c8c4bc;
  }

  /* Alternatives */
  .alternatives {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .alt-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #666;
  }

  .alt-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chip {
    font-size: 0.82rem;
    padding: 0.25rem 0.65rem;
    border: 1px solid rgba(212, 168, 83, 0.2);
    color: #c8c4bc;
    background: rgba(212, 168, 83, 0.05);
  }

  /* Your clues recap */
  .your-clues {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .clues-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #666;
  }

  .clue-row {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
  }

  .round-num {
    font-size: 0.72rem;
    color: #444;
    width: 1rem;
    flex-shrink: 0;
  }

  .clue-text {
    font-size: 0.92rem;
    color: #888;
    line-height: 1.5;
  }

  /* Actions */
  .actions {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .play-btn {
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    padding: 0.9rem 2rem;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: background 0.15s, transform 0.1s;
  }
  .play-btn:hover {
    background: #ffffff;
    transform: translateY(-1px);
  }

  .home-link {
    font-size: 0.9rem;
    color: #b8a98a;
    text-decoration: none;
    letter-spacing: 0.02em;
  }
  .home-link:hover { text-decoration: underline; }
</style>

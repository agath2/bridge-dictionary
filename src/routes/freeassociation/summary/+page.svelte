<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { freeAssociationResults, resetFreeAssociation } from '$lib/freeAssociationStore.js';
  import { politicalAffiliation } from '$lib/gameStore.js';

  const results = get(freeAssociationResults);

  if (results.length === 0) {
    goto('/freeassociation');
  }

  onMount(() => {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game: 'freeassociation',
        affiliation: get(politicalAffiliation),
        session_data: results.map(r => ({ headword: r.headword, words: r.words }))
      })
    });
  });

  function playAgain() {
    resetFreeAssociation();
    goto('/freeassociation');
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Your Associations</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/">← All games</a></p>

    <div class="heading">
      <p class="eyebrow">Your session</p>
      <h1>Words complete</h1>
      <p class="sub">Your responses have been recorded. A full analysis of your associations is coming soon.</p>
    </div>

    <div class="results">
      {#each results as r}
        <div class="result-block">
          <span class="headword">{r.headword}</span>
          <div class="word-chips">
            {#each r.words as word}
              <span class="chip">{word}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>

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
    max-width: 420px;
  }

  /* Per-word results */
  .results {
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
  }

  .result-block {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-bottom: 1.8rem;
    border-bottom: 1px solid #1a1a1a;
  }

  .result-block:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .headword {
    font-size: 1.1rem;
    color: #e8e4dc;
  }

  .word-chips {
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

  /* Actions */
  .actions {
    display: flex;
    align-items: center;
    gap: 2rem;
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

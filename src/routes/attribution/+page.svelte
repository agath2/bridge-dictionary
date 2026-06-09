<script>
  import { goto } from '$app/navigation';
  import { session, results } from '$lib/gameStore.js';

  let loading = $state(false);
  let error = $state(null);

  async function startGame() {
    loading = true;
    error = null;

    try {
      const [stereoRes, ambigRes] = await Promise.all([
        fetch('/stereotype_quotes.json'),
        fetch('/ambiguous_quotes.json')
      ]);

      const stereoQuotes = await stereoRes.json();
      const ambigQuotes = await ambigRes.json();

      // Shuffle each pool independently
      const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);

      // Pick 5 from each, stereotypes first then ambiguous
      const picked = [
        ...shuffled(stereoQuotes).slice(0, 5),
        ...shuffled(ambigQuotes).slice(0, 5)
      ];

      session.set(picked);
      results.set([]);

      goto('/attribution/game');
    } catch (e) {
      error = 'Could not load the game data. Please try again.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Who Said It? — Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/">← All games</a></p>

    <div class="header">
      <div class="label">Game 1</div>
      <h1>Who Said It?</h1>
      <p class="description">
        Every quote below was written by a real person during the 2020 US election.
        Each one contains a word that Republicans and Democrats use very differently.
      </p>
      <p class="description">
        Read the quote and decide which side wrote it. Some are obvious. Some will surprise you.
      </p>
    </div>

    <div class="details">
      <span>10 rounds</span>
      <span class="dot">·</span>
      <span>Real tweets</span>
      <span class="dot">·</span>
      <span>~5 minutes</span>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="play-btn" onclick={startGame} disabled={loading}>
      {loading ? 'Loading…' : 'Start →'}
    </button>
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
  }

  .container {
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.8rem;
  }

  .back a {
    font-size: 0.85rem;
    color: #666;
    text-decoration: none;
  }
  .back a:hover { color: #e8e4dc; }

  .label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 0.4rem;
  }

  h1 {
    font-size: clamp(2rem, 6vw, 2.8rem);
    font-weight: normal;
    line-height: 1.1;
    margin-bottom: 1rem;
  }

  .description {
    font-size: 1rem;
    line-height: 1.7;
    color: #c8c4bc;
  }

  .details {
    font-size: 0.82rem;
    color: #666;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .dot { color: #444; }

  .play-btn {
    background: none;
    border: 1px solid #888;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    padding: 0.85rem 2rem;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: border-color 0.15s, color 0.15s;
    align-self: flex-start;
  }
  .play-btn:hover:not(:disabled) {
    border-color: #e8e4dc;
    color: #fff;
  }
  .play-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .error {
    font-size: 0.88rem;
    color: #c07e7e;
  }
</style>

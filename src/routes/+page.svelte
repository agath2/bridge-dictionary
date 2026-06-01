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

      goto('/game');
    } catch (e) {
      error = 'Could not load the game data. Please try again.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <div class="header">
      <p class="label">A game based on</p>
      <h1>Bridging Dictionary</h1>
      <p class="citation">
        Jiang, Beeferman, Brannon, Heyward &amp; Roy ·
        <a href="https://doi.org/10.1145/3678884.3681820" target="_blank" rel="noopener">
          CSCW 2024
        </a>
      </p>
    </div>

    <div class="description">
      <p>
        Every quote below was written by a real person during the 2020 US election.
        Each one contains a word that Republicans and Democrats use very differently.
      </p>
      <p>
        Your job: read the quote and decide which side wrote it.
      </p>
      <p class="subtext">
        There are no trick questions — but there may be surprises.
      </p>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button class="play-btn" onclick={startGame} disabled={loading}>
      {loading ? 'Loading…' : 'Play'}
    </button>
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .container {
    max-width: 560px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  h1 {
    font-size: clamp(2.2rem, 6vw, 3.2rem);
    font-weight: normal;
    line-height: 1.1;
    color: #e8e4dc;
    letter-spacing: -0.02em;
  }

  .citation {
    font-size: 0.85rem;
    color: #888;
    font-style: italic;
  }

  .citation a {
    color: #b8a98a;
    text-decoration: none;
  }

  .citation a:hover {
    text-decoration: underline;
  }

  .description {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    border-left: 2px solid #2a2a2a;
    padding-left: 1.2rem;
  }

  .description p {
    font-size: 1.05rem;
    line-height: 1.65;
    color: #c8c4bc;
  }

  .subtext {
    font-size: 0.9rem !important;
    color: #888 !important;
    font-style: italic;
  }

  .play-btn {
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    padding: 1rem 2.5rem;
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    align-self: flex-start;
    transition: background 0.15s, transform 0.1s;
  }

  .play-btn:hover:not(:disabled) {
    background: #ffffff;
    transform: translateY(-1px);
  }

  .play-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .error {
    color: #c0674a;
    font-size: 0.9rem;
  }
</style>

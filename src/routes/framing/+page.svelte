<script>
  import { goto } from '$app/navigation';
  import { framingSession, framingResults } from '$lib/framingStore.js';

  let loading = $state(false);
  let error = $state(null);

  const ROUNDS = 8;

  async function startGame() {
    loading = true;
    error = null;

    try {
      const res = await fetch('/game2_manifest.json');
      const manifest = await res.json();

      // Only keep words that have both images ready
      const available = Object.values(manifest).filter(w => w.r && w.d);

      if (available.length < ROUNDS) {
        error = 'Not enough images available yet. Check back soon.';
        loading = false;
        return;
      }

      // Shuffle and pick ROUNDS words
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, ROUNDS).map(w => ({
        ...w,
        // Randomly assign which image appears on the left
        left: Math.random() < 0.5 ? 'R' : 'D'
      }));

      framingSession.set(picked);
      framingResults.set([]);

      goto('/framing/game');
    } catch (e) {
      error = 'Could not load the game data. Please try again.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Through Whose Eyes? — Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/">← All games</a></p>

    <div class="header">
      <div class="label">Game 2</div>
      <h1>Through Whose Eyes?</h1>
      <p class="description">
        The same word can conjure completely different images depending on where you stand politically.
      </p>
      <p class="description">
        You'll see a politically charged word and two AI-generated images — one from each side's framing.
        Pick the one that feels most true to you.
      </p>
    </div>

    <div class="details">
      <span>8 rounds</span>
      <span class="dot">·</span>
      <span>No right answers</span>
      <span class="dot">·</span>
      <span>~4 minutes</span>
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

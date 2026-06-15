<script>
  import { goto } from '$app/navigation';
  import { freeAssociationSession, freeAssociationResults } from '$lib/freeAssociationStore.js';

  let loading = $state(false);
  let error = $state(null);

  async function startGame() {
    loading = true;
    error = null;

    try {
      const res = await fetch('/freeassociation_words.json');
      const all = await res.json();

      const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 5);

      freeAssociationSession.set(shuffled);
      freeAssociationResults.set([]);

      goto('/freeassociation/game');
    } catch (e) {
      error = 'Could not load game data. Please try again.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Free Association — Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/">← All games</a></p>

    <div class="header">
      <div class="label">Game 4</div>
      <h1>Free Association</h1>
      <p class="description">
        A politically charged word appears on screen. Say aloud — as fast as you can —
        every word that comes to mind. You have 15 seconds per word.
      </p>
      <p class="description">
        There are no right answers. What you say reveals the mental landscape you've built
        around these words.
      </p>
    </div>

    <div class="details">
      <span>5 words</span>
      <span class="dot">·</span>
      <span>15 seconds each</span>
      <span class="dot">·</span>
      <span>Microphone required</span>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button onclick={startGame} disabled={loading} class="play-btn">
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

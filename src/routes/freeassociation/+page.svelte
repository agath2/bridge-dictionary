<script>
  import { goto } from '$app/navigation';
  import { freeAssociationSession, resetFreeAssociation } from '$lib/freeAssociationStore.js';

  async function start() {
    const res = await fetch('/freeassociation_words.json');
    const allWords = await res.json();

    const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 5);

    resetFreeAssociation();
    freeAssociationSession.set(shuffled);
    goto('/freeassociation/game');
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Free Association</title>
</svelte:head>

<main>
  <div class="top-bar">
    <a href="/" class="home-link">Bridging Dictionary</a>
  </div>

  <div class="content">
    <p class="eyebrow">Game 4</p>
    <h1>Free Association</h1>

    <p class="description">
      A politically charged word appears on screen. Say aloud — as fast as you can —
      every word that comes to mind. You have 15 seconds per word.
    </p>

    <p class="description">
      There are no right answers. What you say reveals the mental landscape you've built
      around these words.
    </p>

    <div class="details">
      <div class="detail-item">
        <span class="detail-label">Words</span>
        <span class="detail-value">5 per session</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Time per word</span>
        <span class="detail-value">15 seconds</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Required</span>
        <span class="detail-value">Microphone access</span>
      </div>
    </div>

    <button class="start-btn" onclick={start}>Begin →</button>
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
    flex-direction: column;
    padding: 1.5rem 2rem 3rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .top-bar {
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #1e1e1e;
    margin-bottom: 5rem;
  }

  .home-link {
    font-size: 0.85rem;
    color: #888;
    text-decoration: none;
    letter-spacing: 0.04em;
  }

  .home-link:hover { color: #e8e4dc; }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 520px;
  }

  .eyebrow {
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #666;
  }

  h1 {
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: normal;
    line-height: 1.15;
  }

  .description {
    font-size: 1rem;
    line-height: 1.75;
    color: #c8c4bc;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 1.2rem 1.4rem;
    border: 1px solid #1e1e1e;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.88rem;
  }

  .detail-label { color: #666; }
  .detail-value { color: #c8c4bc; }

  .start-btn {
    margin-top: 0.5rem;
    align-self: flex-start;
    padding: 0.9rem 2rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.05em;
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .start-btn:hover { opacity: 0.85; }
</style>

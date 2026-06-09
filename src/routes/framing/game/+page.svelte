<script>
  import { goto } from '$app/navigation';
  import { framingSession, framingResults } from '$lib/framingStore.js';
  import { get } from 'svelte/store';

  let session = get(framingSession);

  if (session.length === 0) {
    goto('/framing');
  }

  let currentIndex = $state(0);
  let chosen = $state(null);       // 'left' | 'right' — which image the player clicked
  let isTransitioning = $state(false);
  let roundStartTime = $state(Date.now());

  let current = $derived(session[currentIndex]);
  let progress = $derived(`${currentIndex + 1} / ${session.length}`);

  // Derive which side each position shows
  let leftSide  = $derived(current?.left ?? 'R');
  let rightSide = $derived(leftSide === 'R' ? 'D' : 'R');
  let leftImage  = $derived(leftSide  === 'R' ? current?.r : current?.d);
  let rightImage = $derived(rightSide === 'R' ? current?.r : current?.d);

  function handlePick(position) {
    if (isTransitioning || chosen) return;

    const responseTime = Date.now() - roundStartTime;
    const chosenSide = position === 'left' ? leftSide : rightSide;

    chosen = position;
    isTransitioning = true;

    framingResults.update(r => [...r, {
      slug: current.slug,
      word: current.word,
      r_image: current.r,
      d_image: current.d,
      chosen_side: chosenSide,
      response_time_ms: responseTime
    }]);

    setTimeout(() => {
      chosen = null;
      isTransitioning = false;

      if (currentIndex + 1 >= session.length) {
        goto('/framing/summary');
      } else {
        currentIndex += 1;
        roundStartTime = Date.now();
      }
    }, 700);
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Round {currentIndex + 1}</title>
</svelte:head>

<main>
  <div class="top-bar">
    <a href="/framing" class="home-link">Bridging Dictionary</a>
    <span class="progress">{progress}</span>
  </div>

  {#if current}
    <div class="game-area">

      <div class="word-display">
        <span class="word-label">Which image fits</span>
        <h2 class="word">{current.word}</h2>
      </div>

      <div class="images-row">
        <button
          class="image-btn"
          class:selected={chosen === 'left'}
          onclick={() => handlePick('left')}
          disabled={isTransitioning}
          aria-label="Choose left image"
        >
          <img src={leftImage} alt="Interpretation A of {current.word}" />
        </button>

        <button
          class="image-btn"
          class:selected={chosen === 'right'}
          onclick={() => handlePick('right')}
          disabled={isTransitioning}
          aria-label="Choose right image"
        >
          <img src={rightImage} alt="Interpretation B of {current.word}" />
        </button>
      </div>

      <p class="hint">Pick the image that feels most accurate to you</p>

    </div>
  {/if}
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
    max-width: 960px;
    margin: 0 auto;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #1e1e1e;
    margin-bottom: 3rem;
  }

  .home-link {
    font-size: 0.85rem;
    color: #888;
    text-decoration: none;
    letter-spacing: 0.04em;
  }

  .home-link:hover { color: #e8e4dc; }

  .progress {
    font-size: 0.85rem;
    color: #888;
    letter-spacing: 0.08em;
    font-family: 'Courier New', monospace;
  }

  .game-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
  }

  .word-display {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .word-label {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .word {
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: normal;
    color: #d4a853;
    letter-spacing: -0.01em;
  }

  .images-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
    width: 100%;
  }

  .image-btn {
    background: none;
    border: 2px solid #2a2a2a;
    padding: 0;
    cursor: pointer;
    border-radius: 2px;
    overflow: hidden;
    transition: border-color 0.15s, transform 0.1s;
    aspect-ratio: 3 / 2;
  }

  .image-btn:hover:not(:disabled) {
    border-color: #888;
    transform: translateY(-2px);
  }

  .image-btn:disabled {
    cursor: default;
  }

  .image-btn.selected {
    border-color: #d4a853;
    transform: translateY(-2px);
  }

  .image-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hint {
    font-size: 0.85rem;
    color: #555;
    font-style: italic;
    letter-spacing: 0.02em;
  }

  @media (max-width: 540px) {
    .images-row {
      grid-template-columns: 1fr;
    }
  }
</style>

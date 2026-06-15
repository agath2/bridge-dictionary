<script>
  import { goto } from '$app/navigation';
  import { session, results } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let sessionQuotes = get(session);

  // Redirect home if someone lands here directly with no session
  if (sessionQuotes.length === 0) {
    goto('/attribution');
  }

  let currentIndex = $state(0);
  let feedback = $state(null); // 'correct' | 'wrong' | null
  let roundStartTime = $state(Date.now());
  let isTransitioning = $state(false);

  let currentQuote = $derived(sessionQuotes[currentIndex]);
  let progress = $derived(`${currentIndex + 1} / ${sessionQuotes.length}`);

  // Highlight the dictionary word inside the quote text
  function highlightWord(quote, word) {
    if (!word || !quote) return quote;
    // Escape special regex chars in the word
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return quote.replace(regex, `<mark>$1</mark>`);
  }

  function handleGuess(guess) {
    if (isTransitioning) return;

    const responseTime = Date.now() - roundStartTime;
    const correct = guess === currentQuote.side;

    feedback = correct ? 'correct' : 'wrong';
    isTransitioning = true;

    // Record the result
    results.update(r => [...r, {
      quote: currentQuote,
      guess,
      correct,
      response_time_ms: responseTime,
      type: currentQuote.type
    }]);

    // Show feedback briefly then advance
    setTimeout(() => {
      feedback = null;
      isTransitioning = false;

      if (currentIndex + 1 >= sessionQuotes.length) {
        goto('/affiliation?next=/attribution/summary');
      } else {
        currentIndex += 1;
        roundStartTime = Date.now();
      }
    }, 900);
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · Round {currentIndex + 1}</title>
</svelte:head>

<main>
  <div class="top-bar">
    <a href="/attribution" class="home-link">Bridging Dictionary</a>
    <span class="progress">{progress}</span>
  </div>

  {#if currentQuote}
    <div class="game-area" class:correct={feedback === 'correct'} class:wrong={feedback === 'wrong'}>

      <div class="phase-label">
        {currentIndex < 5 ? '' : ''}
      </div>

      <div class="quote-card">
        <p class="quote-text">
          {@html highlightWord(currentQuote.quote, currentQuote.word)}
        </p>
      </div>

      <div class="buttons">
        <button
          class="choice-btn democrat"
          onclick={() => handleGuess('D')}
          disabled={isTransitioning}
        >
          Democrat
        </button>
        <button
          class="choice-btn republican"
          onclick={() => handleGuess('R')}
          disabled={isTransitioning}
        >
          Republican
        </button>
      </div>

      {#if feedback}
        <div class="feedback-banner" class:correct={feedback === 'correct'} class:wrong={feedback === 'wrong'}>
          {#if feedback === 'correct'}
            Correct
          {:else}
            That was a {currentQuote.side === 'R' ? 'Republican' : 'Democrat'}
          {/if}
        </div>
      {/if}

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
    max-width: 720px;
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

  .home-link:hover {
    color: #e8e4dc;
  }

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
    justify-content: center;
    gap: 2.5rem;
    transition: background 0.3s;
    border-radius: 4px;
    padding: 1rem;
    position: relative;
  }

  .quote-card {
    padding: 2rem 0;
    border-top: 1px solid #2a2a2a;
    border-bottom: 1px solid #2a2a2a;
  }

  .quote-text {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    line-height: 1.7;
    color: #e8e4dc;
    font-style: italic;
  }

  /* The highlighted dictionary word */
  :global(mark) {
    background: none;
    color: #d4a853;
    font-style: normal;
    font-weight: bold;
    border-bottom: 2px solid #d4a853;
    padding-bottom: 1px;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .choice-btn {
    flex: 1;
    min-width: 140px;
    padding: 1rem 1.5rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.05em;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
  }

  .choice-btn:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .choice-btn.democrat {
    color: #6a9fd8;
    border-color: #6a9fd8;
  }

  .choice-btn.democrat:hover:not(:disabled) {
    background: #6a9fd8;
    color: #0f0f0f;
  }

  .choice-btn.republican {
    color: #c0674a;
    border-color: #c0674a;
  }

  .choice-btn.republican:hover:not(:disabled) {
    background: #c0674a;
    color: #0f0f0f;
  }

  .feedback-banner {
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    border-radius: 2px;
    animation: fadeIn 0.15s ease;
  }

  .feedback-banner.correct {
    background: #2a3d2a;
    color: #7ec87e;
    border: 1px solid #7ec87e;
  }

  .feedback-banner.wrong {
    background: #3d2a2a;
    color: #c07e7e;
    border: 1px solid #c0674a;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>

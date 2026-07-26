<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { session, results } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let sessionWords = get(session);

  if (browser && sessionWords.length === 0) {
    goto('/attribution');
  }

  let currentIndex = $state(0);
  let guess = $state(null);       // 'R' | 'D' | null
  let correct = $state(null);     // boolean | null
  let roundStartTime = $state(Date.now());

  let currentWord = $derived(sessionWords[currentIndex]);
  let progress = $derived(`${currentIndex + 1} / ${sessionWords.length}`);

  // Majority side based on usage percentages
  function majoritySide(item) {
    return item.republican_pct >= item.democrat_pct ? 'R' : 'D';
  }

  function handleGuess(g) {
    if (guess !== null) return;

    const responseTime = Date.now() - roundStartTime;
    const side = majoritySide(currentWord);
    const isCorrect = g === side;

    guess = g;
    correct = isCorrect;

    results.update(r => [...r, {
      word: currentWord,
      guess: g,
      correct: isCorrect,
      response_time_ms: responseTime,
      type: currentWord.type
    }]);

    setTimeout(() => {
      if (currentIndex + 1 >= sessionWords.length) {
        goto('/affiliation?next=/attribution/summary');
      } else {
        currentIndex += 1;
        guess = null;
        correct = null;
        roundStartTime = Date.now();
      }
    }, 600);
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

  {#if currentWord}
    <div class="game-area">

      <div class="word-card">
        <p class="prompt">Which side uses this word more?</p>
        <p class="word">{currentWord.word}</p>
      </div>

      <div class="buttons">
        <button
          class="choice-btn democrat"
          class:chosen={guess === 'D'}
          class:unchosen={guess !== null && guess !== 'D'}
          onclick={() => handleGuess('D')}
          disabled={guess !== null}
        >
          Democrat
        </button>
        <button
          class="choice-btn republican"
          class:chosen={guess === 'R'}
          class:unchosen={guess !== null && guess !== 'R'}
          onclick={() => handleGuess('R')}
          disabled={guess !== null}
        >
          Republican
        </button>
      </div>


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
    max-width: 600px;
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
    justify-content: center;
    gap: 2.5rem;
    padding-top: 10px;
  }


  .word-card {
    padding: 2.5rem 0;
    border-top: 1px solid #2a2a2a;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .prompt {
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
  }

  .word {
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: normal;
    color: #d4a853;
    letter-spacing: 0.02em;
    line-height: 1.1;
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
  }

  .choice-btn.democrat {
    color: #6a9fd8;
    border-color: #6a9fd8;
  }
  .choice-btn.democrat:hover:not(:disabled) {
    background: #6a9fd8;
    color: #0f0f0f;
  }
  .choice-btn.democrat.chosen {
    background: #6a9fd8;
    color: #0f0f0f;
  }
  .choice-btn.democrat.unchosen {
    opacity: 0.25;
  }

  .choice-btn.republican {
    color: #c0674a;
    border-color: #c0674a;
  }
  .choice-btn.republican:hover:not(:disabled) {
    background: #c0674a;
    color: #0f0f0f;
  }
  .choice-btn.republican.chosen {
    background: #c0674a;
    color: #0f0f0f;
  }
  .choice-btn.republican.unchosen {
    opacity: 0.25;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>

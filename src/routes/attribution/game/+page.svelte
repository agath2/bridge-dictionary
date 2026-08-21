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
        goto('/affiliation?next=/association');
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="page">
    <div class="top-bar">
      <a href="/attribution" class="home-link">Bridging Dictionary</a>
      <span class="progress">{progress}</span>
    </div>

    {#if currentWord}
      <div class="game-area">
        <div class="prompt-block">
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
  </div>
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(body) {
    margin: 0;
    background: #06090c;
  }

  main {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 20%, #10161f 0%, #06090c 60%);
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    display: flex;
    justify-content: center;
    padding: 48px 24px;
    box-sizing: border-box;
  }

  .page {
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 24px;
    border-bottom: 1px solid #1e2733;
    margin-bottom: 56px;
  }

  .home-link {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 15px;
    color: #d6dde3;
    text-decoration: none;
    letter-spacing: 0.02em;
  }
  .home-link:hover {
    color: #e8e2d0;
  }

  .progress {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    color: #a3b0bd;
    letter-spacing: 0.08em;
  }

  .game-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 40px;
  }

  .prompt-block {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .prompt {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin-bottom: 0;
  }

  .word {
    border-left: 2px solid rgba(240, 223, 160, 0.5);
    padding: 4px 0 4px 24px;
    font-family: 'Google Sans Flex', sans-serif;
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 500;
    color: hsl(43, 100%, 79%);
    letter-spacing: 0.01em;
    line-height: 1.1;
    margin: 0;
  }

  .buttons {
    display: flex;
    gap: 16px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .choice-btn {
    flex: 1;
    min-width: 140px;
    padding: 16px 24px;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    font-size: 17px;
    letter-spacing: 0.02em;
    border: 1px solid;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
    background: transparent;
  }

  .choice-btn:hover:not(:disabled) {
    transform: translateY(-2px);
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
    color: #0a0d10;
  }
  .choice-btn.democrat.chosen {
    background: #6a9fd8;
    color: #0a0d10;
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
    color: #0a0d10;
  }
  .choice-btn.republican.chosen {
    background: #c0674a;
    color: #0a0d10;
  }
  .choice-btn.republican.unchosen {
    opacity: 0.25;
  }
</style>

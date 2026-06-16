<script>
  import { goto } from '$app/navigation';
  import { session, results } from '$lib/gameStore.js';
  import { get } from 'svelte/store';

  let sessionWords = get(session);

  if (sessionWords.length === 0) {
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
  }

  function advance() {
    if (currentIndex + 1 >= sessionWords.length) {
      goto('/affiliation?next=/attribution/summary');
    } else {
      currentIndex += 1;
      guess = null;
      correct = null;
      roundStartTime = Date.now();
    }
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

      <div class="content">
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

      <div class="reveal-slot">
        {#if guess !== null}
          <div class="reveal" class:correct={correct} class:wrong={!correct}>
            <div class="bars">
              <div class="bar-row">
                <span class="bar-label republican-label">Republican</span>
                <div class="bar-track">
                  <div class="bar-fill republican-fill" style="width: {currentWord.republican_pct}%"></div>
                </div>
                <span class="bar-pct">{currentWord.republican_pct.toFixed(0)}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-label democrat-label">Democrat</span>
                <div class="bar-track">
                  <div class="bar-fill democrat-fill" style="width: {currentWord.democrat_pct}%"></div>
                </div>
                <span class="bar-pct">{currentWord.democrat_pct.toFixed(0)}%</span>
              </div>
            </div>

            <button class="next-btn" onclick={advance}>
              {currentIndex + 1 >= sessionWords.length ? 'See results →' : 'Next →'}
            </button>
          </div>
        {/if}
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
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2.5rem;
  }

  .reveal-slot {
    min-height: 160px;
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

  /* Reveal panel */
  .reveal {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem;
    border-radius: 2px;
    animation: fadeIn 0.2s ease;
  }

  .reveal.correct {
    background: #1a2a1a;
    border: 1px solid #3a5a3a;
  }

  .reveal.wrong {
    background: #2a1a1a;
    border: 1px solid #5a3a3a;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .bar-label {
    font-size: 0.8rem;
    width: 80px;
    flex-shrink: 0;
    letter-spacing: 0.03em;
  }

  .republican-label { color: #c0674a; }
  .democrat-label { color: #6a9fd8; }

  .bar-track {
    flex: 1;
    height: 6px;
    background: #2a2a2a;
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .republican-fill { background: #c0674a; }
  .democrat-fill { background: #6a9fd8; }

  .bar-pct {
    font-size: 0.8rem;
    color: #888;
    width: 36px;
    text-align: right;
    font-family: 'Courier New', monospace;
  }

  .next-btn {
    background: none;
    border: 1px solid #888;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.65rem 1.5rem;
    cursor: pointer;
    letter-spacing: 0.04em;
    align-self: flex-start;
    transition: border-color 0.15s, color 0.15s;
  }
  .next-btn:hover {
    border-color: #e8e4dc;
    color: #fff;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>

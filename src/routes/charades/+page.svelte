<script>
  import { goto } from '$app/navigation';
  import { charadesWord, charadesHistory, charadesStatus } from '$lib/charadesStore.js';
  import charadesWords from '$lib/data/charades_words.json';

  function startGame() {
    const word = charadesWords[Math.floor(Math.random() * charadesWords.length)];

    charadesWord.set(word);
    charadesHistory.set([]);
    charadesStatus.set('playing');

    goto('/charades/game');
  }
</script>

<svelte:head>
  <title>Charades — Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">
    <p class="back"><a href="/dev/landing">← All games</a></p>

    <div class="header">
      <div class="label">Game 5</div>
      <h1>Charades</h1>
      <p class="description">
        A word from the Bridging Dictionary is chosen at random. Describe it to an AI
        without saying the word itself — no synonyms, no root words.
      </p>
      <p class="description">
        The AI guesses after each clue. See how many rounds it takes.
        Then discover how each side of the political spectrum actually uses that word.
      </p>
    </div>

    <div class="details">
      <span>1 word</span>
      <span class="dot">·</span>
      <span>Up to 8 rounds</span>
      <span class="dot">·</span>
      <span>Text input</span>
    </div>

    <button onclick={startGame} class="play-btn">Start →</button>
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
  .play-btn:hover {
    border-color: #e8e4dc;
    color: #fff;
  }
</style>

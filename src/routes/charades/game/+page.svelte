<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { charadesWord, charadesHistory, charadesStatus } from '$lib/charadesStore.js';

  const MAX_ROUNDS = 8;

  const word = get(charadesWord);

  if (browser && !word) {
    goto('/charades');
  }

  let history = $state([]);
  let clue = $state('');
  let thinking = $state(false);
  let pendingClue = $state('');
  let status = $state('playing'); // 'playing' | 'correct' | 'gaveup'

  let roundCount = $derived(history.length);
  let atLimit = $derived(roundCount >= MAX_ROUNDS);

  let historyEnd = $state(null);

  $effect(() => {
    history.length;
    thinking;
    historyEnd?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  async function submitClue() {
    const trimmed = clue.trim();
    if (!trimmed || thinking || status !== 'playing') return;

    clue = '';
    pendingClue = trimmed;
    thinking = true;

    let guess, correct;
    try {
      const res = await fetch('/api/charades-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWord: word.headword, history: [...history, { clue: trimmed }] })
      });
      const data = await res.json();
      if (!res.ok || !data.guess) {
        console.error('guess API error', res.status, data);
        guess = '(error — try again)';
        correct = false;
      } else {
        guess = data.guess;
        correct = data.correct;
      }
    } catch (e) {
      console.error('guess fetch error', e);
      guess = '(error — try again)';
      correct = false;
    }

    history = [...history, { clue: trimmed, guess }];
    thinking = false;
    pendingClue = '';

    if (correct) {
      finishGame('correct');
    } else if (roundCount >= MAX_ROUNDS) {
      finishGame('gaveup');
    }
  }

  function giveUp() {
    finishGame('gaveup');
  }

  function finishGame(outcome) {
    status = outcome;
    charadesHistory.set(history);
    charadesStatus.set(outcome);
    if (outcome !== 'correct') {
      goto('/affiliation?next=/charades/summary');
    }
  }

  function continueToSummary() {
    goto('/affiliation?next=/charades/summary');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitClue();
    }
  }
</script>

<svelte:head>
  <title>Charades — Bridging Dictionary</title>
</svelte:head>

{#if word}
  <main>
    <div class="top-bar">
      <a href="/charades" class="back">← Back</a>
      <span class="round-count">Round {roundCount + (thinking ? 1 : 1)} of {MAX_ROUNDS}</span>
    </div>

    <div class="word-block">
      <span class="word-label">describe this word</span>
      <span class="word-text">{word.headword}</span>
      <span class="word-rule">Don't say the word, its root, or direct synonyms</span>
    </div>

    <div class="history-scroll">
      <div class="history">
        {#each history as round, i}
          <div class="round">
            <div class="round-number">Round {i + 1}</div>
            <div class="clue-row">
              <span class="role you">You</span>
              <span class="bubble clue-bubble">{round.clue}</span>
            </div>
            <div class="guess-row">
              <span class="role ai">AI</span>
              <span class="bubble guess-bubble">{round.guess}</span>
            </div>
          </div>
        {/each}

        {#if thinking}
          <div class="round">
            <div class="round-number">Round {roundCount + 1}</div>
            <div class="clue-row">
              <span class="role you">You</span>
              <span class="bubble clue-bubble">{pendingClue}</span>
            </div>
            <div class="guess-row">
              <span class="role ai">AI</span>
              <span class="bubble guess-bubble thinking">thinking…</span>
            </div>
          </div>
        {/if}

        <div bind:this={historyEnd}></div>
      </div>
    </div>

    {#if status === 'correct'}
      <div class="input-area correct-banner">
        <p class="correct-message">
          Correct — the AI got it in {roundCount} {roundCount === 1 ? 'round' : 'rounds'}.
        </p>
        <button class="continue-btn" onclick={continueToSummary}>See results →</button>
      </div>
    {:else if status === 'playing' && !atLimit}
      <div class="input-area">
        <textarea
          bind:value={clue}
          onkeydown={handleKeydown}
          placeholder="Type your clue…"
          rows="2"
          disabled={thinking}
        ></textarea>
        <div class="input-actions">
          <button class="give-up-btn" onclick={giveUp} disabled={thinking}>Give up</button>
          <button class="submit-btn" onclick={submitClue} disabled={thinking || !clue.trim()}>
            Submit →
          </button>
        </div>
      </div>
    {/if}
  </main>
{/if}

<style>
  :global(body) {
    background: #0f0f0f;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    height: 100vh;
    overflow: hidden;
  }

  main {
    max-width: 600px;
    height: 100vh;
    margin: 0 auto;
    padding: 1.4rem 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .back {
    font-size: 0.85rem;
    color: #666;
    text-decoration: none;
  }
  .back:hover { color: #e8e4dc; }

  .round-count {
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
  }

  .word-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 0 1rem;
    text-align: center;
    flex-shrink: 0;
  }

  .word-label {
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #555;
  }

  .word-text {
    font-size: clamp(2rem, 6vw, 3rem);
    color: #d4a853;
    letter-spacing: -0.01em;
  }

  .word-rule {
    font-size: 0.8rem;
    color: #444;
    font-style: italic;
    margin-top: 0.25rem;
  }

  /* History */
  .history-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin-top: 1rem;
    padding-bottom: 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: #2a2a2a transparent;
  }
  .history-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .history-scroll::-webkit-scrollbar-thumb {
    background: #2a2a2a;
    border-radius: 3px;
  }
  .history-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .history {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .round {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .round-number {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 0.1rem;
  }

  .clue-row, .guess-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .role {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    width: 2.2rem;
    flex-shrink: 0;
    padding-top: 0.35rem;
  }

  .you { color: #888; }
  .ai  { color: #6a9fd8; }

  .bubble {
    font-size: 0.95rem;
    line-height: 1.5;
    padding: 0.5rem 0.85rem;
    border: 1px solid #2a2a2a;
    color: #c8c4bc;
    max-width: 100%;
  }

  .clue-bubble {
    border-color: #2a2a2a;
    background: rgba(255,255,255,0.02);
  }

  .guess-bubble {
    border-color: rgba(106, 159, 216, 0.25);
    background: rgba(106, 159, 216, 0.05);
    color: #6a9fd8;
  }

  .guess-bubble.thinking {
    color: #444;
    font-style: italic;
    border-style: dashed;
  }

  /* Input */
  .input-area {
    flex-shrink: 0;
    background: #0f0f0f;
    border-top: 1px solid #1e1e1e;
    padding: 1rem 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  textarea {
    width: 100%;
    background: #111;
    border: 1px solid #2a2a2a;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.65rem 0.85rem;
    resize: none;
    line-height: 1.5;
    outline: none;
    transition: border-color 0.15s;
  }
  textarea:focus { border-color: #555; }
  textarea:disabled { opacity: 0.4; }

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .give-up-btn {
    background: none;
    border: none;
    color: #555;
    font-family: 'Georgia', serif;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
    letter-spacing: 0.03em;
    transition: color 0.15s;
  }
  .give-up-btn:hover:not(:disabled) { color: #c07e7e; }
  .give-up-btn:disabled { opacity: 0.3; cursor: default; }

  .submit-btn {
    background: none;
    border: 1px solid #888;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.6rem 1.5rem;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: border-color 0.15s, color 0.15s;
  }
  .submit-btn:hover:not(:disabled) {
    border-color: #e8e4dc;
    color: #fff;
  }
  .submit-btn:disabled { opacity: 0.3; cursor: default; }

  .correct-banner {
    align-items: center;
    text-align: center;
    background: #2a3d2a;
    border-top-color: #3a4a3a;
  }

  .correct-message {
    color: #7ec87e;
    font-size: 1rem;
  }

  .continue-btn {
    background: none;
    border: 1px solid #7ec87e;
    color: #7ec87e;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.6rem 1.5rem;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: background 0.15s, color 0.15s;
  }
  .continue-btn:hover {
    background: #7ec87e;
    color: #0f0f0f;
  }
</style>

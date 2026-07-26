<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { freeAssociationSession, freeAssociationResults } from '$lib/freeAssociationStore.js';

  const session = get(freeAssociationSession);

  if (browser && session.length === 0) {
    goto('/freeassociation');
  }

  const TOTAL_TIME = 15;

  let currentIndex = $state(0);
  // phase: 'idle' | 'listening' | 'done'
  let phase = $state('idle');
  let timeLeft = $state(TOTAL_TIME);
  let words = $state([]);
  let supported = $state(true);

  let current = $derived(session[currentIndex] ?? null);
  let isLast = $derived(currentIndex === session.length - 1);

  let recognition = null;
  let timerInterval = null;
  let wordSet = new Set();

  onMount(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      supported = false;
      return;
    }

    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const phrase = event.results[i][0].transcript.trim().toLowerCase();
          if (phrase && !wordSet.has(phrase)) {
            wordSet.add(phrase);
            words = [...words, phrase];
          }
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        console.warn('SpeechRecognition error:', e.error);
      }
    };
  });

  onDestroy(() => {
    stopAll();
  });

  function stopAll() {
    clearInterval(timerInterval);
    timerInterval = null;
    try { recognition?.stop(); } catch (_) {}
  }

  function startListening() {
    words = [];
    wordSet = new Set();
    timeLeft = TOTAL_TIME;
    phase = 'listening';

    recognition.start();

    timerInterval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        try { recognition.stop(); } catch (_) {}
        phase = 'done';
      }
    }, 1000);
  }

  function advance() {
    if (words.length === 0) return;

    freeAssociationResults.update(r => [
      ...r,
      { headword: current, words: [...words] }
    ]);

    if (isLast) {
      goto('/affiliation?next=/freeassociation/summary');
    } else {
      currentIndex += 1;
      phase = 'idle';
      words = [];
      wordSet = new Set();
      timeLeft = TOTAL_TIME;
    }
  }
</script>

<svelte:head>
  <title>Free Association — Bridging Dictionary</title>
</svelte:head>

{#if !supported}
  <main class="unsupported">
    <p class="unsupported-msg">
      Free Association requires speech recognition, which is only supported in Chrome and Edge.
      Please open this page in one of those browsers.
    </p>
    <a href="/freeassociation" class="back-link">← Back</a>
  </main>
{:else if current}
  <main>
    <div class="top-bar">
      <a href="/freeassociation" class="back">← Back</a>
      <span class="progress">Word {currentIndex + 1} of {session.length}</span>
    </div>

    <div class="stage">
      <div class="word-block">
        <span class="word-label">say what comes to mind</span>
        <span class="word-text">{current}</span>
      </div>

      {#if phase === 'idle'}
        <button class="action-btn" onclick={startListening}>
          ● Start speaking
        </button>

      {:else if phase === 'listening'}
        <div class="timer-row">
          <span class="timer" class:urgent={timeLeft <= 5}>{timeLeft}</span>
          <span class="timer-label">seconds left</span>
        </div>

      {:else if phase === 'done'}
        <div class="done-row">
          {#if words.length === 0}
            <p class="no-input-msg">No words were captured. Try again — you need at least one word to continue.</p>
            <button class="action-btn" onclick={startListening}>Try again ↺</button>
          {:else}
            <button class="next-btn" onclick={advance}>
              {isLast ? 'See your results →' : 'Next word →'}
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <div class="chips-area">
      {#if words.length > 0}
        <div class="chips">
          {#each words as word}
            <span class="chip">{word}</span>
          {/each}
        </div>
      {:else if phase === 'listening'}
        <p class="listening-hint">Listening…</p>
      {/if}
    </div>
  </main>
{/if}

<style>
  :global(body) {
    background: #0f0f0f;
    color: #e8e4dc;
    font-family: 'Georgia', serif;
    min-height: 100vh;
    overflow: hidden;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 1.2rem 2rem 2rem;
    max-width: 680px;
    margin: 0 auto;
  }

  /* Unsupported */
  main.unsupported {
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .unsupported-msg {
    font-size: 1rem;
    line-height: 1.7;
    color: #c8c4bc;
    max-width: 400px;
  }

  .back-link {
    font-size: 0.9rem;
    color: #888;
    text-decoration: none;
  }

  /* Top bar */
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

  .progress {
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
  }

  /* Stage */
  .stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
  }

  .word-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  .word-label {
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #555;
  }

  .word-text {
    font-size: clamp(2.2rem, 6vw, 3.4rem);
    color: #d4a853;
    letter-spacing: -0.01em;
    text-align: center;
  }

  /* Timer */
  .timer-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .timer {
    font-size: 3rem;
    font-variant-numeric: tabular-nums;
    color: #c8c4bc;
    transition: color 0.3s;
    line-height: 1;
  }

  .timer.urgent { color: #c0674a; }

  .timer-label {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
  }

  /* Done state */
  .done-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .no-input-msg {
    font-size: 0.92rem;
    color: #c0674a;
    text-align: center;
    max-width: 340px;
    line-height: 1.6;
  }

  /* Buttons */
  .action-btn {
    padding: 0.8rem 2rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.04em;
    background: transparent;
    border: 1px solid #555;
    color: #c8c4bc;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .action-btn:hover {
    border-color: #e8e4dc;
    color: #e8e4dc;
  }

  .next-btn {
    padding: 0.8rem 2.2rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.05em;
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .next-btn:hover { opacity: 0.85; }

  /* Chips */
  .chips-area {
    flex-shrink: 0;
    min-height: 5rem;
    padding: 1rem 0 0.5rem;
    border-top: 1px solid #1a1a1a;
  }

  .listening-hint {
    font-size: 0.85rem;
    color: #444;
    font-style: italic;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    font-size: 0.88rem;
    padding: 0.3rem 0.75rem;
    border: 1px solid #2a2a2a;
    color: #c8c4bc;
    background: rgba(212, 168, 83, 0.05);
    border-color: rgba(212, 168, 83, 0.2);
    animation: pop-in 0.15s ease;
  }

  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
</style>

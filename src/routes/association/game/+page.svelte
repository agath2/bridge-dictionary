<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { associationSession, associationResults } from '$lib/associationStore.js';

  const session = get(associationSession);

  if (browser && session.length === 0) {
    goto('/association');
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
  let progress = $derived(`Word ${currentIndex + 1} of ${session.length}`);

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

    associationResults.update(r => [
      ...r,
      { headword: current, words: [...words] }
    ]);

    if (isLast) {
      goto('/affiliation?next=/association/summary');
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

{#if !supported}
  <main class="unsupported">
    <p class="unsupported-msg">
      Free Association requires speech recognition, which is only supported in Chrome and Edge.
      Please open this page in one of those browsers.
    </p>
    <a href="/association" class="back-link">← Back</a>
  </main>
{:else if current}
  <main>
    <div class="page">
      <div class="top-bar">
        <a href="/association" class="home-link">Bridging Dictionary</a>
        <span class="progress">{progress}</span>
      </div>

      <div class="game-area">
        <div class="prompt-block">
          <p class="prompt">Say what comes to mind</p>
          <p class="word">{current}</p>
        </div>

        {#if phase === 'idle'}
          <button class="continue-btn" onclick={startListening}>
            Start speaking
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
              <path d="M12 18v4"/>
              <path d="M8 22h8"/>
            </svg>
          </button>

        {:else if phase === 'listening'}
          <div class="timer-row">
            <span class="timer" class:urgent={timeLeft <= 5}>{timeLeft}</span>
            <span class="timer-label">seconds left</span>
          </div>

        {:else if phase === 'done'}
          <div class="done-row">
            {#if words.length === 0}
              <p class="inline-warning">No words were captured. Try again — you need at least one word to continue.</p>
              <button class="continue-btn" onclick={startListening}>
                Try again
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 1 3 6.7"/>
                  <path d="M3 21v-6h6"/>
                </svg>
              </button>
            {:else}
              <button class="continue-btn" onclick={advance}>
                {isLast ? 'See your results' : 'Next word'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/>
                  <path d="M13 6l6 6-6 6"/>
                </svg>
              </button>
            {/if}
          </div>
        {/if}

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
      </div>
    </div>
  </main>
{/if}

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

  main.unsupported {
    align-items: center;
    text-align: center;
  }

  .unsupported-msg {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 17px;
    line-height: 1.7;
    color: #d6dde3;
    max-width: 420px;
  }

  .back-link {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 14px;
    color: #a3b0bd;
    text-decoration: none;
    margin-top: 20px;
    display: inline-block;
  }
  .back-link:hover {
    color: #e8e2d0;
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
    align-items: center;
    justify-content: center;
    gap: 40px;
    text-align: center;
    padding-top: 80px;
  }

  .prompt-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
  }

  .prompt {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  .word {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 500;
    color: hsl(43, 100%, 79%);
    letter-spacing: 0.01em;
    line-height: 1.1;
    margin: 0;
  }

  .timer-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .timer {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 48px;
    font-variant-numeric: tabular-nums;
    color: #e8e2d0;
    transition: color 0.3s ease;
    line-height: 1;
  }

  .timer.urgent {
    color: #c0674a;
  }

  .timer-label {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
  }

  .done-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .inline-warning {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    color: #d89a84;
    max-width: 340px;
    line-height: 1.6;
    margin: 0;
  }

  .continue-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    background: hsl(43, 100%, 79%);
    color: #14201c;
    border: none;
    padding: 16px 25px;
    font-size: 18px;
    letter-spacing: .03em;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 8px 36px rgba(201,161,59,.35);
    transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .continue-btn:hover {
    transform: translateY(-2px);
  }
  .continue-btn:active {
    transform: translateY(0);
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 4px 16px rgba(201,161,59,.35);
  }

  .chips-area {
    min-height: 60px;
    padding-top: 16px;
  }

  .listening-hint {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    color: #6b7684;
    font-style: italic;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .chip {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    padding: 6px 14px;
    border: 1px solid rgba(240, 223, 160, 0.25);
    border-radius: 999px;
    color: #d6dde3;
    background: rgba(240, 223, 160, 0.06);
    animation: pop-in 0.15s ease;
  }

  @keyframes pop-in {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
</style>

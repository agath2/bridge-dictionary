<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { politicalAffiliation, results, eligibleForRecording, sessionId } from '$lib/gameStore.js';

  const next = $derived(get(page).url.searchParams.get('next') ?? '/');

  onMount(() => {
    if (get(politicalAffiliation) !== null) {
      goto(next, { replaceState: true });
    }
  });

  const options = [
    { value: 'Democrat',           label: 'Democrat',           color: '#6a9fd8' },
    { value: 'Republican',         label: 'Republican',         color: '#c0674a' },
    { value: 'Independent',        label: 'Independent',        color: '#a3b0bd' },
    { value: 'Other',              label: 'Other',              color: '#a3b0bd' },
    { value: 'Prefer not to say',  label: 'Prefer not to say',  color: '#a3b0bd' },
  ];

  let selected = $state(null);

  function choose(value) {
    selected = value;
  }

  function submit() {
    if (!selected) return;
    politicalAffiliation.set(selected);

    // Attribution finishes right before this page, so its recording waits
    // until affiliation is known rather than posting with affiliation: null.
    const attributionResults = get(results);
    if (attributionResults.length > 0 && get(eligibleForRecording)) {
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'attribution',
          affiliation: selected,
          session_id: get(sessionId),
          eligible: true,
          session_data: attributionResults.map(r => ({
            word: r.word.word,
            guess: r.guess,
            correct: r.correct,
            response_time_ms: r.response_time_ms,
            type: r.type
          }))
        })
      });
    }

    goto(next);
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · One quick question</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="page">
    <div class="content">
      <p class="eyebrow">before the next game</p>
      <h1>How do you identify politically?</h1>
      <p class="intro">This helps us understand patterns across perspectives. Your answer is anonymous.</p>

      <div class="options">
        {#each options as opt}
          <button
            class="option-btn"
            class:selected={selected === opt.value}
            style="--accent: {opt.color}"
            onclick={() => choose(opt.value)}
          >
            {opt.label}
          </button>
        {/each}
      </div>

      <button class="continue-btn" disabled={!selected} onclick={submit}>
        Continue
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M13 6l6 6-6 6"/>
        </svg>
      </button>
    </div>
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
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    box-sizing: border-box;
  }

  .page {
    width: 100%;
    max-width: 640px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .eyebrow {
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  h1 {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 34px;
    font-weight: 500;
    color: #e8e2d0;
    margin: 0;
    line-height: 1.2;
  }

  .intro {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 17px;
    line-height: 1.6;
    color: #d6dde3;
    margin: 0;
  }

  .options {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-btn {
    padding: 14px 18px;
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 16px;
    text-align: left;
    background: transparent;
    border: 1px solid #2a3440;
    color: #e8e2d0;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    border-radius: 2px;
  }

  .option-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .option-btn.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .continue-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    background: hsl(43, 100%, 79%);
    color: #14201c;
    border: none;
    padding: 16px 25px;
    margin-top: 10px;
    font-size: 18px;
    letter-spacing: .03em;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 8px 36px rgba(201,161,59,.35);
    transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease, opacity 0.2s ease;
  }
  .continue-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .continue-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 4px 16px rgba(201,161,59,.35);
  }
  .continue-btn:disabled {
    opacity: 0.4;
    cursor: default;
    box-shadow: none;
  }
</style>

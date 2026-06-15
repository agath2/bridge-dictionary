<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { politicalAffiliation } from '$lib/gameStore.js';

  const next = $derived(get(page).url.searchParams.get('next') ?? '/');

  onMount(() => {
    if (get(politicalAffiliation) !== null) {
      goto(next, { replaceState: true });
    }
  });

  const options = [
    { value: 'Democrat',           label: 'Democrat',           color: '#6a9fd8' },
    { value: 'Republican',         label: 'Republican',         color: '#c0674a' },
    { value: 'Independent',        label: 'Independent',        color: '#888' },
    { value: 'Other',              label: 'Other',              color: '#888' },
    { value: 'Prefer not to say',  label: 'Prefer not to say',  color: '#888' },
  ];

  let selected = $state(null);

  function choose(value) {
    selected = value;
  }

  function submit() {
    if (!selected) return;
    politicalAffiliation.set(selected);
    goto(next);
  }
</script>

<svelte:head>
  <title>Bridging Dictionary · One quick question</title>
</svelte:head>

<main>
  <div class="top-bar">
    <a href="/" class="home-link">Bridging Dictionary</a>
  </div>

  <div class="content">
    <p class="eyebrow">Before your results</p>
    <h1>How do you identify politically?</h1>
    <p class="sub">This helps us understand patterns across different perspectives. Your answer is anonymous.</p>

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
      See my results
    </button>
  </div>
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
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #1e1e1e;
    margin-bottom: 4rem;
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

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    max-width: 480px;
  }

  .eyebrow {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  h1 {
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: normal;
    line-height: 1.3;
    color: #e8e4dc;
  }

  .sub {
    font-size: 0.95rem;
    color: #888;
    line-height: 1.6;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  .option-btn {
    padding: 0.85rem 1.2rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    text-align: left;
    background: transparent;
    border: 1px solid #2a2a2a;
    color: #e8e4dc;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
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
    margin-top: 0.5rem;
    padding: 0.9rem 1.5rem;
    font-family: 'Georgia', serif;
    font-size: 1rem;
    letter-spacing: 0.05em;
    background: #e8e4dc;
    color: #0f0f0f;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
    align-self: flex-start;
    border-radius: 2px;
  }

  .continue-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .continue-btn:not(:disabled):hover {
    opacity: 0.85;
  }
</style>

<script>
  import { goto } from '$app/navigation';
  import { session, results } from '$lib/gameStore.js';

  let loading = $state(false);
  let error = $state(null);

  async function startGame() {
    loading = true;
    error = null;

    try {
      const [stereoRes, ambigRes] = await Promise.all([
        fetch('/attribution/stereotype_quotes.json'),
        fetch('/attribution/ambiguous_quotes.json')
      ]);

      const stereoWords = await stereoRes.json();
      const ambigWords = await ambigRes.json();

      const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);

      const picked = [
        ...shuffled(stereoWords).slice(0, 5),
        ...shuffled(ambigWords).slice(0, 5)
      ];

      session.set(picked);
      results.set([]);

      goto('/attribution/game');
    } catch (e) {
      error = 'Could not load the game data. Please try again.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Which Side Says It More? — Bridging Dictionary</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="page">
    <div class="content">
      <p class="eyebrow">game 1 of 3</p>
      <h1>Which Side Says It More?</h1>
      <div class="card">
        <p class="intro">
          Republicans and Democrats speak the same words, but perhaps with different preferences.
        </p>
        <p class="intro">
          A word will appear on screen, decide which side uses it more.
        </p>
      </div>

      <div class="details">
        <span>10 words</span>
        <span class="dot">·</span>
        <span>Real usage data</span>
        <span class="dot">·</span>
        <span>~3 minutes</span>
      </div>

      {#if error}
        <p class="inline-warning">{error}</p>
      {/if}

      <button class="continue-btn" onclick={startGame} disabled={loading}>
        {loading ? 'Loading…' : 'Start'}
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
    padding-top: 98px;
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
    font-size: 15px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  h1 {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 40px;
    font-weight: 500;
    color: #e8e2d0;
    margin-top: 0px;
    margin-bottom: 20px;
    line-height: 1.15;
  }

  .intro {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 18px;
    line-height: 1.6;
    color: #d6dde3;
    margin: 0;
  }

  .card {
    border-left: 2px solid rgba(240, 223, 160, 0.7);
    padding: 4px 0 4px 24px;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    opacity: 0;
    gap: 10px;
    animation: slide-down 0.5s ease 0.1s forwards;
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .details {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 14px;
    color: #a3b0bd;
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 15px;
  }

  .dot {
    color: #4a5560;
  }

  .inline-warning {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    color: #d89a84;
    margin: 0;
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
    transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .continue-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .continue-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 4px 16px rgba(201,161,59,.35);
  }
  .continue-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>

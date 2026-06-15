<svelte:head>
  <title>Bridging Dictionary</title>
</svelte:head>

<main>
  <div class="container">

    <div class="header">
      <h1>Bridging Dictionary</h1>
      <p class="subtitle">
        Every word means something different depending on who's speaking.
        These games use real political tweets from the 2020 US election to explore how language divides — and what it reveals about how we read each other.
      </p>
      <p class="citation">
        Based on
        <a href="https://doi.org/10.1145/3678884.3681820" target="_blank" rel="noopener">
          Jiang, Beeferman, Brannon, Heyward &amp; Roy · CSCW 2024
        </a>
      </p>
    </div>

    <div class="games">

      <a href="/attribution" class="card">
        <div class="card-label">Game 1</div>
        <h2 class="card-title">Which Side Says It More?</h2>
        <p class="card-description">
          See a word from the Bridging Dictionary and decide which side uses it more.
          Then see the real usage split.
        </p>
        <span class="card-cta">Play →</span>
      </a>

      <a href="/framing" class="card">
        <div class="card-label">Game 2</div>
        <h2 class="card-title">Through Whose Eyes?</h2>
        <p class="card-description">
          See a politically charged word. Two images — one from each side's framing. Pick the one that feels true to you.
        </p>
        <span class="card-cta">Play →</span>
      </a>

      <a href="/network" class="card">
        <div class="card-label">Game 3</div>
        <h2 class="card-title">Word Web</h2>
        <p class="card-description">
          A word floats at the center. Surrounding it are related words — emotions, associations, context. Click the ones you'd connect to it. See how your web compares.
        </p>
        <span class="card-cta">Play →</span>
      </a>

      <a href="/freeassociation" class="card">
        <div class="card-label">Game 4</div>
        <h2 class="card-title">Free Association</h2>
        <p class="card-description">
          A word appears. Speak every association that comes to mind — fast, unfiltered, for 15 seconds. Your words reveal the mental landscape you've built around political language.
        </p>
        <span class="card-cta">Play →</span>
      </a>

    </div>

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
    overflow-y: auto;
  }

  main {
    min-height: 100vh;
    padding: clamp(4rem, 28vh, 14rem) 2rem 6rem;
  }

  .container {
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
  }

  /* Header */
  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    font-size: clamp(2.2rem, 6vw, 3.2rem);
    font-weight: normal;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 1.05rem;
    line-height: 1.7;
    color: #c8c4bc;
    max-width: 540px;
  }

  .citation {
    font-size: 0.82rem;
    color: #666;
    font-style: italic;
  }

  .citation a {
    color: #b8a98a;
    text-decoration: none;
  }

  .citation a:hover {
    text-decoration: underline;
  }

  /* Game cards */
  .games {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.2rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.8rem;
    border: 1px solid #2a2a2a;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s, transform 0.1s;
  }

  .card:not(.card--soon):hover {
    border-color: #888;
    transform: translateY(-2px);
  }

  .card--soon {
    opacity: 0.4;
    cursor: default;
  }

  .card-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
  }

  .card-title {
    font-size: 1.4rem;
    font-weight: normal;
    color: #e8e4dc;
  }

  .card-description {
    font-size: 0.92rem;
    line-height: 1.6;
    color: #999;
    flex: 1;
  }

  .card-cta {
    font-size: 0.88rem;
    color: #b8a98a;
    margin-top: 0.5rem;
    letter-spacing: 0.03em;
  }
</style>

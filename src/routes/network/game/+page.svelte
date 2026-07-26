<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { networkSession, networkResults } from '$lib/networkStore.js';

  const sessionWords = get(networkSession);

  if (browser && sessionWords.length === 0) {
    goto('/network');
  }

  let currentIndex = $state(0);
  let clicked = $state(new Set());
  let positions = $state([]);

  let current = $derived(sessionWords[currentIndex] ?? null);
  let isLast = $derived(currentIndex === sessionWords.length - 1);

  // Two-ring layout: half words on outer ring, half interleaved on inner ring.
  // This guarantees even angular separation and prevents overlap.
  function computePositions(count) {
    const outerR = 285;
    const innerR = 185;
    const half = Math.ceil(count / 2);
    const result = new Array(count);

    for (let i = 0; i < count; i++) {
      const isOuter = i % 2 === 0;
      const ringCount = isOuter ? half : count - half;
      const ringIndex = Math.floor(i / 2);
      // Inner ring rotated by half a step so words interleave with outer ring
      const offset = isOuter ? 0 : Math.PI / ringCount;
      const angle = (ringIndex / ringCount) * 2 * Math.PI + offset - Math.PI / 2;
      const r = isOuter ? outerR : innerR;
      result[i] = {
        dx: Math.cos(angle) * r,
        dy: Math.sin(angle) * r,
        delay: (i * 0.15).toFixed(2),
        duration: (3.4 + (i % 4) * 0.35).toFixed(2)
      };
    }
    return result;
  }

  onMount(() => {
    if (current) positions = computePositions(current.satellite_words.length);
  });

  // Recompute positions when word changes
  $effect(() => {
    if (current) positions = computePositions(current.satellite_words.length);
  });

  function toggleWord(word) {
    const next = new Set(clicked);
    if (next.has(word)) next.delete(word);
    else next.add(word);
    clicked = next;
  }

  function advance() {
    networkResults.update(r => [
      ...r,
      {
        headword: current.word,
        r_frame: current.r_frame,
        d_frame: current.d_frame,
        satellite_words: current.satellite_words,
        clicked: [...clicked]
      }
    ]);

    clicked = new Set();

    if (isLast) {
      goto('/affiliation?next=/network/summary');
    } else {
      currentIndex += 1;
    }
  }
</script>

<svelte:head>
  <title>Word Web — Bridging Dictionary</title>
</svelte:head>

{#if current}
<main>
  <div class="top-bar">
    <a href="/network" class="back">← Back</a>
    <span class="progress">Word {currentIndex + 1} of {sessionWords.length}</span>
  </div>

  <div class="stage">
    <!-- Satellite words -->
    {#each current.satellite_words as sw, i}
      {#if positions[i]}
        <button
          class="satellite"
          class:selected={clicked.has(sw.word)}
          style="
            left: calc(50% + {positions[i].dx}px);
            top: calc(50% + {positions[i].dy}px);
            animation-delay: {positions[i].delay}s;
            animation-duration: {positions[i].duration}s;
          "
          onclick={() => toggleWord(sw.word)}
        >
          {sw.word}
        </button>
      {/if}
    {/each}

    <!-- Center word -->
    <div class="center-word">
      <span class="center-label">the word</span>
      <span class="center-text">{current.word}</span>
    </div>
  </div>

  <div class="bottom-bar">
    <p class="hint">
      {clicked.size === 0
        ? 'Click the words you associate with this term.'
        : `${clicked.size} word${clicked.size === 1 ? '' : 's'} selected`}
    </p>
    <button class="next-btn" onclick={advance}>
      {isLast ? 'See your results →' : 'Next word →'}
    </button>
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
    padding: 1.2rem 1.5rem;
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

  .progress {
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
  }

  /* ── Stage ─────────────────────────────────────── */
  .stage {
    position: relative;
    flex: 1;
    width: 600px;
    max-width: 100%;
    margin: 0 auto;
  }

  /* Center word */
  .center-word {
    position: absolute;
    left: 50%;
    top: 46%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }

  .center-label {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 0.4rem;
  }

  .center-text {
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    color: #d4a853;
    letter-spacing: -0.01em;
  }

  /* Satellite words */
  @keyframes float {
    0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
    50%       { transform: translate(-50%, -50%) translateY(-7px); }
  }

  .satellite {
    position: absolute;
    transform: translate(-50%, -50%);
    background: none;
    border: 1px solid #333;
    color: #888;
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    padding: 0.45rem 1rem;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    animation: float linear infinite;
  }

  .satellite:hover {
    border-color: #888;
    color: #e8e4dc;
  }

  .satellite.selected {
    border-color: #d4a853;
    color: #d4a853;
    background: rgba(212, 168, 83, 0.08);
  }

  /* ── Bottom bar ─────────────────────────────────── */
  .bottom-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.5rem;
    gap: 1rem;
  }

  .hint {
    font-size: 0.85rem;
    color: #555;
    font-style: italic;
  }

  .next-btn {
    background: none;
    border: 1px solid #555;
    color: #c8c4bc;
    font-family: 'Georgia', serif;
    font-size: 0.95rem;
    padding: 0.6rem 1.4rem;
    cursor: pointer;
    letter-spacing: 0.03em;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .next-btn:hover {
    border-color: #e8e4dc;
    color: #fff;
  }
</style>

<script>
  import { onMount } from 'svelte';

  let canvasEl;
  let rotateWordEl;

  onMount(() => {
    // --- Rotating word in subhead ---
    const words = ['speaking', 'listening', 'reading', 'typing'];
    let i = 0;

    function nextWord() {
      rotateWordEl.style.transform = 'translateY(-100%)';
      rotateWordEl.style.opacity = '0';

      setTimeout(() => {
        i = (i + 1) % words.length;
        rotateWordEl.textContent = words[i];

        rotateWordEl.style.transition = 'none';
        rotateWordEl.style.transform = 'translateY(100%)';

        // force the browser to commit the above styles right now, before continuing
        void rotateWordEl.offsetHeight;

        rotateWordEl.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        rotateWordEl.style.transform = 'translateY(0)';
        rotateWordEl.style.opacity = '1';
      }, 400);
    }

    const rotateInterval = setInterval(nextWord, 1800);

    // --- Background word-cloud canvas ---
    const canvas = canvasEl;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    let W, H;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Word list: replace `f` (frequency) with real corpus counts or partisan-skew scores
    const vocab = [
      { t: 'freedom', f: 6 }, { t: 'unity', f: 6 }, { t: 'justice', f: 6 }, { t: 'patriot', f: 4 },
      { t: 'reform', f: 4 }, { t: 'rights', f: 6 }, { t: 'liberty', f: 5 }, { t: 'equity', f: 4 },
      { t: 'nation', f: 6 }, { t: 'values', f: 5 }, { t: 'change', f: 4 }, { t: 'safety', f: 4 },
      { t: 'truth', f: 6 }, { t: 'family', f: 5 }, { t: 'power', f: 4 }, { t: 'faith', f: 4 },
      { t: 'community', f: 6 }, { t: 'gender', f: 4 }, { t: 'welfare', f: 5 }, { t: 'climate', f: 5 },
      { t: 'border security', f: 4 }, { t: 'immigration', f: 5 }, { t: 'censorship', f: 4 }, { t: 'diversity', f: 6 },
      { t: 'police', f: 4 }, { t: 'institution', f: 5 }, { t: 'education', f: 6 }, { t: 'democracy', f: 6 },
      { t: 'democrat', f: 5 }, { t: 'republican', f: 5 }, { t: 'conservative', f: 6 }, { t: 'liberal', f: 6 },
      { t: 'freedom', f: 6 }, { t: 'unity', f: 6 }, { t: 'justice', f: 6 }, { t: 'patriot', f: 4 },
      { t: 'reform', f: 4 }, { t: 'rights', f: 6 }, { t: 'liberty', f: 5 }, { t: 'equity', f: 4 },
      { t: 'nation', f: 6 }, { t: 'values', f: 5 }, { t: 'change', f: 4 }, { t: 'safety', f: 4 },
      { t: 'truth', f: 6 }, { t: 'family', f: 5 }, { t: 'power', f: 4 }, { t: 'faith', f: 4 },
      { t: 'community', f: 6 }, { t: 'gender', f: 4 }, { t: 'welfare', f: 5 }, { t: 'climate', f: 5 },
      { t: 'border security', f: 4 }, { t: 'immigration', f: 5 }, { t: 'censorship', f: 4 }, { t: 'diversity', f: 6 },
      { t: 'police', f: 4 }, { t: 'institution', f: 5 }, { t: 'education', f: 6 }, { t: 'democracy', f: 6 },
      { t: 'democrat', f: 5 }, { t: 'republican', f: 5 }, { t: 'conservative', f: 6 }, { t: 'liberal', f: 6 }
    ];
    const colors = ['#f0f0f0', '#a0a0a0'];

    // Build word objects: size and speed both derive from frequency
    const words2 = vocab.map((v, idx) => ({
      text: v.t,
      size: 6 + v.f * 2.8,
      x: Math.random() * 1.3 * W - 0.15 * W,
      y: 30 + Math.random() * (H - 60),
      speed: 0.01 + v.f * 0.15,
      color: colors[idx % 2],
      opacity: 0.14 + Math.random() * 0.10
    }));

    let rafId;

    function drawFrame() {
      ctx.clearRect(0, 0, W, H);
      ctx.textBaseline = 'middle';
      for (let idx = 0; idx < words2.length; idx++) {
        const w = words2[idx];
        if (!prefersReducedMotion) w.x += w.speed;

        ctx.font = w.size + "px 'Google Sans Flex', sans-serif";
        const width = ctx.measureText(w.text).width;
        if (w.x - width / 2 > W) w.x = -width / 2 - 20;

        const positionFactor = Math.max(0, w.x / W);
        const curvedFactor = Math.pow(positionFactor, 3);
        const dynamicOpacity = w.opacity * (0.4 + curvedFactor * 4.8);

        ctx.globalAlpha = Math.min(dynamicOpacity, 0.9);
        ctx.fillStyle = w.color;
        ctx.fillText(w.text, w.x, w.y);
      }
      ctx.globalAlpha = 1;
    }

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      (function loop() {
        drawFrame();
        rafId = requestAnimationFrame(loop);
      })();
    }

    return () => {
      clearInterval(rotateInterval);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });
</script>

<svelte:head>
  <title>Bridging Dictionary — Word Cloud Hero</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=JetBrains+Mono:wght@400;500&&display=swap" rel="stylesheet">
</svelte:head>

<div class="hero">
  <canvas id="wc" bind:this={canvasEl}></canvas>
  <div class="hero-content">
    <p class="eyebrow">a study of political language</p>
    <h1>Bridging Dictionary</h1>
    <p class="subhead">
      Every word means something different depending on who's
      <span class="rotate-wrap">
        <span id="rotate-word" bind:this={rotateWordEl}>speaking</span>
      </span>
    </p>
    <button class="play-btn">Participate in the study</button>
  </div>
  <p class="meta">
    ~5 minutes · anonymous · a research study · IRB protocol #[pending]
  </p>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  .hero {
    background: linear-gradient(90deg, #080a0d 0%, #1e2733 100%);
    overflow: hidden;
    position: relative;
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }
  #wc {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .hero-content {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    padding-left: 250px;
    padding-top: 50px;
    pointer-events: none;
  }
  .eyebrow {
    font-size: 16px;
    letter-spacing: .05em;
    color: #d6dde3;
    margin: 0 0 14px;
  }
  h1 {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 50px;
    color: #e8e2d0;
    margin: 0 0 30px;
    font-weight: 500;
  }
  .subhead {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 32px;
    color: #e8e2d0;
    margin: 30px 0 30px;
    font-weight: 400;
    max-width: 700px;
    line-height: 1.5;
  }
  .play-btn {
    pointer-events: auto;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    background: hsl(43, 100%, 79%);
    color: #14201c;
    border: none;
    padding: 16px 27px;
    font-size: 18px;
    letter-spacing: .03em;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 8px 36px rgba(201,161,59,.35);
  }
  .meta {
    position: absolute;
    bottom: 50px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 16px;
    color: #d6dde3;
    margin: 0;
  }
  .rotate-wrap {
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
    height: 1.5em;
  }
  #rotate-word {
    display: inline-block;
    color: hsl(43, 100%, 79%);
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
</style>

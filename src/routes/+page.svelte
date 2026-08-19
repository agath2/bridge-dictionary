<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let canvasEl;
  let rotateWordEl;

  onMount(() => {
    // --- Stagger-reveal breakdown items on scroll ---
    const items = document.querySelectorAll('.breakdown-item');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Array.from(items).indexOf(entry.target);
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, index * 200); // 200ms stagger between each item
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.3 }
    );
    items.forEach((item) => observer.observe(item));

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
      observer.disconnect();
      clearInterval(rotateInterval);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });
</script>

<svelte:head>
  <title>Bridging Dictionary Game Suite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<div class="hero" id="top">
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
    <button class="play-btn" onclick={() => goto('/survey')}>
      <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Play now
    </button>
  </div>
  <p class="meta">
    ~8 minutes · anonymous · a research study · IRB protocol #[pending]
  </p>
</div>

<div class="about-section">
  <div class="game-breakdown">
    <p class="breakdown-label">You'll play three short word games:</p>
    <div class="breakdown-list">
      <div class="breakdown-item">
        <span class="breakdown-num">01</span>
        <span class="breakdown-desc">Snap judgments about words</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-num">02</span>
        <span class="breakdown-desc">Saying the first things that come to mind</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-num">03</span>
        <span class="breakdown-desc">Giving clues to help an AI guess a word</span>
      </div>
    </div>
    <p class="breakdown-note">There are no right or wrong answers, and nothing here is a test of political knowledge.</p>
  </div>

  <div class="info-card">
    <div class="info-intro">
      <p class="about-label">About the study</p>
      <p class="about-text">This study asks how Americans use and understand words differently. </p>
    </div>

    <div class="info-details">
      <div class="info-row">
        <p class="about-key">Run by</p>
        <p class="about-value">Human-AI Nexus Group · Northeastern University</p>
      </div>
      <div class="info-row">
        <p class="about-key">Data</p>
        <p class="about-value">Anonymous, may inform published research</p>
      </div>
      <div class="info-row">
        <p class="about-key">Contact</p>
        <p class="about-value">[email]</p>
      </div>
    </div>
  </div>
</div>

<footer class="site-footer">
  <p class="footer-mark">Bridging Dictionary</p>
  <a href="#top" class="footer-top">Back to top ↑</a>
  <p class="footer-copyright">© 2026 Human-AI Nexus Group</p>
</footer>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  :global(body) {
    margin: 0;
  }
  .hero {
    background: linear-gradient(90deg, #080a0d 0%, #1e2733 100%);
    overflow: hidden;
    position: relative;
    min-height: 100vh;
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
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
    display: inline-flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    font-family: 'Google Sans Flex', sans-serif;
    font-weight: 500;
    background: hsl(43, 100%, 79%);
    color: #14201c;
    border: none;
    padding: 16px 20px;
    padding-right: 28px;
    font-size: 18px;
    letter-spacing: .03em;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 8px 36px rgba(201,161,59,.35);
    transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .play-btn:hover {
    transform: translateY(-2px);
  }
  .play-btn:active {
    transform: translateY(0);
    box-shadow: 0 0 0 1px rgba(240,223,160,.2), 0 4px 16px rgba(201,161,59,.35);
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

  /*          *
   *  ABOUT   *
   *          */
  .about-section {
    background: radial-gradient(ellipse at 20% 30%, #10161f 0%, #06090c 60%);
    padding: 100px 250px;
    border-top: 1px solid #1e2733;
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 80px;
    align-items: flex-start;
  }

  .game-breakdown {
    padding: 36px 0;
    margin-left: 60px;
  }
  .breakdown-label {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 16px;
    color: #e8e2d0;
    margin: 0 0 24px;
  }
  .breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-left: 55px;
    margin-bottom: 24px;
  }
  .breakdown-item {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: baseline;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .breakdown-item:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 16px;
    width: 1px;
    height: 20px;
    background: hsla(43, 100%, 79%, .4);
  }
  .breakdown-item:global(.is-visible) {
    opacity: 1;
    transform: translateY(0);
  }
  .breakdown-num {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 25px;
    color: hsl(43, 100%, 79%);
    min-width: 20px;
  }
  .breakdown-desc {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 20px;
    color: #d6dde3;
    margin-left: 20px;
  }
  .breakdown-note {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    color: #a3b0bd;
    margin-left: 40px;
    margin-top: 40px;
    line-height: 1.6;
  }

  .info-card {
    background: linear-gradient(220deg, rgba(126, 141, 154, 0.25) 5%, rgba(0, 5, 39, 0.25) 55%);
    border: none;
    border-radius: 20px;
    padding: 46px 40px;
    margin-bottom: 30px;
    box-sizing: border-box;
    display: flex;
    align-self: center;
    flex-direction: row;
    align-items: flex-start;
    gap: 48px;
    box-shadow: 5px 5px 15px 0 rgba(113, 127, 175, 0.28);
  }
  .about-label {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0 0 20px;
  }
  .about-text {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 20px;
    line-height: 1.6;
    color: #d6dde3;
    margin: 0 0 56px;
  }
  .info-intro {
    flex: 0 0 auto;
    width: 400px;
  }
  .info-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 220px;
    border-left: 1px solid rgba(255,255,255,0.2);
    padding-left: 32px;
  }
  .info-row .about-key {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0 0 6px;
  }
  .info-row .about-value {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 16px;
    color: #e8e2d0;
    margin: 0;
  }

  /*          *
   *  FOOTER  *
   *          */
  .site-footer {
    background: #06080a;
    border-top: 1px solid #1e2733;
    padding: 32px 200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .footer-mark {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 14px;
    color: #d6dde3;
    margin: 0;
  }
  .footer-top {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 12px;
    color: #a3b0bd;
    text-decoration: none;
  }
  .footer-top:hover {
    color: #d6dde3;
  }
  .footer-copyright {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 11px;
    color: #6b7684;
    margin: 0;
  }
</style>

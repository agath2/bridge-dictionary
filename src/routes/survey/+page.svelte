<script>
  import { goto } from '$app/navigation';
  import { eligibleForRecording } from '$lib/gameStore.js';

  let ageChecked = $state(false);
  let languageChecked = $state(false);
  let politicalChecked = $state(false);
  let consentChecked = $state(false);

  let attemptedContinue = $state(false);

  // Eligibility failures stay invisible to the participant — someone who
  // doesn't qualify can still play. This flag is what tells the backend
  // not to record their session as study data.
  const meetsEligibility = $derived(ageChecked && languageChecked && politicalChecked);

  function handleContinue() {
    attemptedContinue = true;
    if (!consentChecked) return;
    eligibleForRecording.set(meetsEligibility);
    goto('/attribution');
  }
</script>

<svelte:head>
  <title>Pre-study Survey</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="page">
    <div class="content">
      <p class="eyebrow">before we begin</p>
      <p class="intro">
        Please confirm the following to continue:
      </p>

      <div class="card">

        <label class="check-row">
          <input type="checkbox" bind:checked={ageChecked} />
          <span class="check-text">I am at least 18 years old.</span>
        </label>

        <label class="check-row">
          <input type="checkbox" bind:checked={languageChecked} />
          <span class="check-text">I am a native or bilingual English speaker.</span>
        </label>

        <label class="check-row">
          <input type="checkbox" bind:checked={politicalChecked} />
          <span class="check-text">I am American, or otherwise embedded in the U.S. political environment.</span>
        </label>
      </div>

      <div class="card">
        <p class="card-label">Research consent</p>

        <label class="check-row" class:invalid={attemptedContinue && !consentChecked}>
          <input type="checkbox" bind:checked={consentChecked} />
          <span class="check-text">I agree to participate in this research study. My responses may be recorded anonymously and used in published research.</span>
        </label>

        <div class="warning-slot" class:expanded={attemptedContinue && !consentChecked}>
          <p class="inline-warning">You must agree to participate before continuing to the games.</p>
        </div>
      </div>

      <button class="continue-btn" onclick={handleContinue}>
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
    height: 100vh;
    background: radial-gradient(ellipse at 20% 20%, #10161f 0%, #06090c 60%);
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    padding-top: 60px;
    box-sizing: border-box;
    overflow: hidden;
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

  .intro {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 20px;
    font-weight: 450;
    line-height: 1.5;
    color: #d6dde3;
    margin: 0 0 6px;
    margin-bottom: 20px;
  }

  .card {
    background: linear-gradient(220deg, rgba(126, 141, 154, 0.16) 5%, rgba(0, 5, 39, 0.16) 55%);
    border-radius: 20px;
    padding: 22px 28px;
    margin-bottom: 10px;
    box-sizing: border-box;
    box-shadow: 5px 5px 15px 0 rgba(113, 127, 175, 0.16);
    display: flex;
    flex-direction: column;
    gap: 10px;
    opacity: 0;
    animation: slide-up 0.5s ease forwards;
  }
  .card:nth-of-type(1) {
    animation-delay: 0.1s;
  }
  .card:nth-of-type(2) {
    animation-delay: 0.25s;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-label {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 12px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #a3b0bd;
    margin: 0;
  }

  .check-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.15s ease;
  }
  .check-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .check-row input {
    margin-top: 3px;
    width: 18px;
    height: 18px;
    accent-color: hsl(43, 100%, 79%);
    cursor: pointer;
    flex-shrink: 0;
  }

  .check-text {
    font-family: 'Google Sans Flex', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #e8e2d0;
  }

  .check-row.invalid {
    background: rgba(192, 103, 74, 0.1);
    outline: 1px solid rgba(192, 103, 74, 0.4);
  }

  .warning-slot {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.3s ease, opacity 0.3s ease;
  }
  .warning-slot.expanded {
    max-height: 60px;
    opacity: 1;
  }

  .inline-warning {
    font-family: "Atkinson Hyperlegible Mono", sans-serif;
    font-size: 13px;
    line-height: 1.5;
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
    margin-top: 15px;
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
</style>

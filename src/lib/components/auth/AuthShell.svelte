<script>
  import ShaderBackground from '../ShaderBackgroundwpink.svelte';

  let {
    title,
    subtitle,
    alternateText,
    alternateHref,
    alternateLabel,
    children
  } = $props();
</script>

<div class="auth-page">
  <ShaderBackground />
  <div class="auth-vignette" aria-hidden="true"></div>

  <main class="auth-stage">
    <section class="auth-panel">
      <header class="auth-header">
        <p class="system-label">Exam system</p>
        <h1>{title}</h1>

        {#if subtitle}
          <p class="subtitle">{subtitle}</p>
        {/if}
      </header>

      {@render children()}

     <footer class="auth-footer">
        <p>
          {alternateText}
          <a href={alternateHref}>{alternateLabel}</a>
        </p>

        <span class="secure-label">
          Focused practice. Measurable progress.
        </span>
      </footer>
    </section>
  </main>
</div>

<style>
  .auth-page {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    background: #080808;
    color: #f5f5f5;
    font-family:
      var(--font-ui);
  }

  .auth-vignette {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at center,
        rgba(0, 0, 0, 0.02) 0%,
        rgba(0, 0, 0, 0.14) 48%,
        rgba(0, 0, 0, 0.58) 100%
      );
  }

  .auth-stage {
    position: relative;
    z-index: 1;
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .auth-panel {
    width: min(100%, 420px);
    padding: 34px;
    background: rgba(10, 16, 15, 0.68);
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 30px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
    backdrop-filter: blur(18px) saturate(112%);
    -webkit-backdrop-filter: blur(18px) saturate(112%);
  }

  .auth-header {
    margin-bottom: 24px;
  }

  .system-label {
    margin: 0 0 10px;
    color: #d4af37;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: #f5f5f5;
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1.15;
  }

  .subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    line-height: 1.55;

    font-family: var(--font-reading);
  }

  .auth-panel :global(.auth-form) {
    display: grid;
    gap: 18px;
  }

  .auth-panel :global(.auth-field) {
    display: grid;
    gap: 7px;
  }

  .auth-panel :global(.auth-field > label) {
    color: rgba(255, 255, 255, 0.78);
    font-size: 12px;
    font-weight: 600;
  }

  .auth-panel :global(input) {
    width: 100%;
    height: 44px;
    padding: 0 13px;
    background: rgba(255, 255, 255, 0.07);
    color: #f5f5f5;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 17px;
    outline: none;
    font: inherit;
    font-size: 14px;
    transition:
      background 120ms ease,
      border-color 120ms ease;
  }

  .auth-panel :global(input::placeholder) {
    color: rgba(255, 255, 255, 0.56);
  }

  .auth-panel :global(input:hover) {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .auth-panel :global(input:focus-visible) {
    background: rgba(255, 255, 255, 0.1);
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.18);
  }

  .auth-panel :global(.password-control) {
    position: relative;
  }

  .auth-panel :global(.password-control input) {
    padding-right: 72px;
  }

  .auth-panel :global(.password-toggle) {
    position: absolute;
    top: 50%;
    right: 6px;
    min-width: 54px;
    height: 32px;
    padding: 0 8px;
    transform: translateY(-50%);
    background: transparent;
    color: rgba(255, 255, 255, 0.72);
    border: 0;
    border-radius: 11px;
    font: inherit;
    font-size: 11px;
    font-weight: 650;
    cursor: pointer;
  }

  .auth-panel :global(.password-toggle:hover) {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .auth-panel :global(.auth-submit) {
    height: 44px;
    margin-top: 5px;
    background: rgba(237, 237, 237, 0.96);
    color: #111;
    border: 0;
    border-radius: 17px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.035em;
    cursor: pointer;
    transition:
      background 120ms ease,
      transform 80ms ease,
      opacity 120ms ease;
  
  }

  .auth-panel :global(.auth-submit:hover:not(:disabled)) {
    background: #fff;
  }

  .auth-panel :global(.auth-submit:active:not(:disabled)) {
    transform: translateY(1px);
  }

  .auth-panel :global(.auth-submit:disabled) {
    opacity: 0.55;
    cursor: wait;
  }

  .auth-panel :global(.auth-submit:focus-visible),
  .auth-panel :global(.password-toggle:focus-visible),
  .auth-footer a:focus-visible {
    outline: 2px solid #d4af37;
    outline-offset: 3px;
  }

  .auth-panel :global(.auth-message) {
    margin: 16px 0 0;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.82);
    font-size: 12px;
    line-height: 1.5;
  }

  .auth-panel :global(.auth-message.error) {
    border-color: rgba(255, 123, 133, 0.36);
    color: #ffabb1;
  }

  .auth-panel :global(.auth-message.success) {
    border-color: rgba(99, 230, 151, 0.3);
    color: #8cebb0;
  }

  .auth-footer {
    margin-top: 24px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .auth-footer p {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 12px;

    font-family: var(--font-reading);
  }

  .auth-footer a {
    margin-left: 6px;
    color: rgba(255, 255, 255, 0.88);
    text-decoration: none;
  }

  .auth-footer a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .secure-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
    letter-spacing: 0.08em;

    font-family: var(--font-reading);
  }

  @media (max-width: 480px) {
    .auth-stage {
      padding: 16px;
    }

    .auth-panel {
      padding: 26px 22px;
      border-radius: 26px;
    }
  }
</style>

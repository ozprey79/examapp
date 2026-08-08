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
        <p class="system-label"></p>
        <!--<h1>{title}</h1>-->
        <!--<p class="subtitle">{subtitle}</p>-->
      </header>

      {@render children()}

    <!--  <footer class="auth-footer">
        <p>
          {alternateText}
          <a href={alternateHref}>{alternateLabel}</a>
        </p>

        <span class="secure-label">Made with lines</span>
      </footer>-->
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
      "Cascadia Code",
      "SFMono-Regular",
      "Roboto Mono",
      "Liberation Mono",
      ui-monospace,
      monospace;
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
    width: min(100%, 390px);
    padding: 32px;
    background: rgba(15, 15, 15, 0.167);
    border: 0px solid rgba(255, 255, 255, 0.11);
    border-radius: 50px;
    box-shadow: 8 24px 80px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(0px) saturate(112%);
    -webkit-backdrop-filter: blur(18px) saturate(112%);
  }

  .auth-header {
    margin-bottom:8px;
    margin-left:150px;
  }

  .system-label {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.46);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: #f5f5f5;
    font: inherit;
    font-size: 25px;
    font-weight: 500;
    letter-spacing: -0.045em;
    line-height: 1.15;
  }

  .subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    line-height: 1.55;
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
    color: rgba(255, 255, 255, 0.62);
    font-size: 11px;
    font-weight: 500;
  }

  .auth-panel :global(input) {
    width: 100%;
    height: 44px;
    padding: 0 13px;
    background: rgba(255, 255, 255, 0.055);
    color: #f5f5f5;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 17px;
    outline: none;
    font: inherit;
    font-size: 12px;
    transition:
      background 120ms ease,
      border-color 120ms ease;
  }

  .auth-panel :global(input:hover) {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .auth-panel :global(input:focus) {
    background: rgba(255, 255, 255, 0.075);
    border-color: rgba(255, 255, 255, 0.45);
  }

  .auth-panel :global(.auth-submit) {
    height: 44px;
    margin-top: 5px;
    background: #edededec;
    color: #111;
    border: 0;
    border-radius: 17px;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.035em;
    cursor: pointer;
    transition:
      background 120ms ease,
      transform 80ms ease,
      opacity 120ms ease;
  
  }

  .auth-panel :global(.auth-submit:hover:not(:disabled)) {
    background: #5904617e;
    color: white;
    border: 1px solid pink;
  }

  .auth-panel :global(.auth-submit:active:not(:disabled)) {
    transform: translateY(1px);
  }

  .auth-panel :global(.auth-submit:disabled) {
    opacity: 0.55;
    cursor: wait;
  }

  .auth-panel :global(.auth-message) {
    margin: 16px 0 0;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.72);
    font-size: 11px;
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
    color: rgba(255, 255, 255, 0.43);
    font-size: 11px;
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
    color: rgba(255, 255, 255, 0.25);
    font-size: 9px;
    letter-spacing: 0.15em;
  }

  @media (max-width: 480px) {
    .auth-stage {
      padding: 16px;
    }

    .auth-panel {
      padding: 26px 22px;
    }
  }
</style>

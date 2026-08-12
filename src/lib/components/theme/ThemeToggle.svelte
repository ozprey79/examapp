<script>
  import { onMount } from "svelte";

  const STORAGE_KEY = "examapp-theme";

  let theme = $state("dark");

  function applyTheme(nextTheme) {
    theme = nextTheme === "bauhaus" ? "bauhaus" : "dark";

    if (theme === "bauhaus") {
      document.documentElement.dataset.theme = "bauhaus";
    } else {
      delete document.documentElement.dataset.theme;
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "bauhaus" ? "dark" : "bauhaus";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  onMount(() => {
    applyTheme(localStorage.getItem(STORAGE_KEY));
  });
</script>

<button
  type="button"
  class="theme-toggle"
  aria-label={`Switch to ${theme === "bauhaus" ? "dark" : "Bauhaus"} theme`}
  aria-pressed={theme === "bauhaus"}
  title={`Switch to ${theme === "bauhaus" ? "dark" : "Bauhaus"} theme`}
  onclick={toggleTheme}
>
  <span class="theme-mark" aria-hidden="true">
    <i></i>
    <i></i>
    <i></i>
  </span>

  <span>{theme === "bauhaus" ? "Dark" : "Bauhaus"}</span>
</button>

<style>
  .theme-toggle {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    font-family: var(--font-ui);
    font-size: calc(var(--font-size-base) * 0.76);
    font-weight: 600;
  }

  .theme-toggle:hover {
    background: var(--surface-hover);
    color: var(--text);
    border-color: var(--border);
  }

  .theme-mark {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .theme-mark i {
    width: 7px;
    aspect-ratio: 1;
    display: block;
    border: 1px solid currentColor;
  }

  .theme-mark i:nth-child(1) {
    background: #d5382f;
    border-radius: 50%;
  }

  .theme-mark i:nth-child(2) {
    background: #efbf2f;
  }

  .theme-mark i:nth-child(3) {
    background: #175da8;
    transform: rotate(45deg) scale(0.78);
  }

  :global(html[data-theme='bauhaus']) .theme-toggle {
    background: var(--warning);
    color: var(--text);
    border: 2px solid var(--text);
    box-shadow: 3px 3px 0 var(--text);
  }

  :global(html[data-theme='bauhaus']) .theme-toggle:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--text);
  }

  @media (max-width: 480px) {
    .theme-toggle > span:last-child {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  }
</style>

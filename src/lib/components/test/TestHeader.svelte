<script>
  let {
    title,
    subtitle = '',
    onRestart = undefined
  } = $props();
</script>

<header class="test-header">
  <div>
    <h1>{title}</h1>

    {#if subtitle}
      <p>{subtitle}</p>
    {/if}
  </div>

  {#if onRestart}
    <button
      class="button"
      type="button"
      onclick={onRestart}
    >
      Restart
    </button>
  {/if}
</header>

<style>
  .test-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;

    margin-bottom: 22px;
  }

  h1 {
    margin: 0 0 4px;

    color: var(--primary);

    font-size: 20px;
    line-height: 1.25;
    font-weight: 600;
  }

  p {
    margin: 0;

    color: var(--text-muted);
    font-size: 13px;
  }

  .button {
    min-height: 40px;
    padding: 0 16px;

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .button:hover {
    background: var(--surface-hover);
  }

  @media (max-width: 760px) {
    .test-header {
      flex-direction: column;
    }
  }
</style>
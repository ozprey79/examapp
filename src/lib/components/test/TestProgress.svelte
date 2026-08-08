<script>
  let {
    completed = 0,
    total = 100
  } = $props();

  let percentage = $derived(
    total > 0
      ? Math.min((completed / total) * 100, 100)
      : 0
  );
</script>

<section class="progress-section">
  <div
    class="progress-track"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax={total}
    aria-valuenow={completed}
  >
    <div
      class="progress-fill"
      style={`width: ${percentage}%`}
    ></div>
  </div>

  <span class="progress-count">
    {completed} / {total}
  </span>
</section>

<style>
  .progress-section {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;

    margin-top: 28px;
  }

  .progress-track {
    height: 5px;
    overflow: hidden;

    background: var(--surface-strong);

    border: 1px solid var(--border-soft);
    border-radius: 999px;
  }

  .progress-fill {
    height: 100%;

    background: var(--primary);
    border-radius: inherit;
  }

  .progress-count {
    min-width: 54px;

    color: var(--text-muted);
    font-size: 12px;
    text-align: right;
  }
</style>
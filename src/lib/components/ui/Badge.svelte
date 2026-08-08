<script>
  let {
    children,
    variant = 'neutral'
  } = $props();
</script>

<span class="badge {variant}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;

    min-height: 24px;
    padding: 2px 8px;

    border-radius: 999px;

    font-size: var(--text-xs);
    font-weight: 600;
    line-height: 1;
  }

  .neutral {
    background: var(--surface-subtle);
    color: var(--text-muted);
  }

  .accent {
    background: var(--accent-soft);
    color: var(--accent);
  }

  .success {
    background: color-mix(
      in srgb,
      var(--success) 10%,
      transparent
    );

    color: var(--success);
  }

  .warning {
    background: color-mix(
      in srgb,
      var(--warning) 10%,
      transparent
    );

    color: var(--warning);
  }

  .danger {
    background: color-mix(
      in srgb,
      var(--danger) 10%,
      transparent
    );

    color: var(--danger);
  }
</style>
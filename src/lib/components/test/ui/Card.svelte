<script>
  let {
    children,
    padding = 'normal',
    class: className = ''
  } = $props();
</script>

<div class="card {padding} {className}">
  {@render children()}
</div>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  .compact {
    padding: var(--space-4);
  }

  .normal {
    padding: var(--space-6);
  }

  .large {
    padding: var(--space-8);
  }
</style>
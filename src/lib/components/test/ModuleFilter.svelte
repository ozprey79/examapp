<script>
  let {
    modules = [],
    selected = 'all',
    onSelect = undefined
  } = $props();
</script>

<section class="module-filters">
  <button
    type="button"
    class="module-button"
    class:active={selected === 'all'}
    onclick={() => onSelect?.('all')}
  >
    All
  </button>

  {#each modules as module}
    <button
      type="button"
      class="module-button"
      class:active={selected === module.id}
      onclick={() => onSelect?.(module.id)}
    >
      {module.label}
    </button>
  {/each}
</section>

<style>
  .module-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;

    margin-top: 18px;
  }

  .module-button {
    min-height: 30px;
    padding: 4px 12px;

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: 6px;

    font-size: 12px;
    line-height: 1.2;
  }

  .module-button:hover {
    background: var(--surface-hover);
  }

  .module-button.active {
    background: var(--primary);
    color: var(--primary-text);

    border-color: var(--primary);

    font-weight: 600;
  }

  @media (max-width: 480px) {
    .module-button {
      flex: 1 1 auto;
    }
  }
</style>
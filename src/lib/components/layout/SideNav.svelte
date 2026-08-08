<script>
  let {
    items = [],
    currentPath = ''
  } = $props();
</script>

<nav class="nav">
  <p class="nav-heading">
    NAVIGATION
  </p>

  <div class="nav-items">
    {#each items as item}
      <a
        href={item.href}
        class:active={currentPath === item.href}
      >
        <span class="indicator"></span>

        <span class="nav-label">
          {item.label}
        </span>

        {#if item.code}
          <span class="nav-code">
            {item.code}
          </span>
        {/if}
      </a>
    {/each}
  </div>
</nav>

<style>
  .nav {
    padding: var(--space-6) var(--space-4);
  }

  .nav-heading {
    margin: 0 0 var(--space-4);

    padding-left: var(--space-3);

    font-size: 0.65rem;
    font-weight: 650;
    color: var(--text-faint);

    letter-spacing: 0.14em;
  }

  .nav-items {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  a {
    position: relative;

    min-height: 42px;

    display: flex;
    align-items: center;

    padding: 0 var(--space-3);

    color: var(--text-muted);

    border-radius: var(--radius-sm);

    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.07em;

    transition:
      background 120ms ease,
      color 120ms ease;
  }

  a:hover {
    background: var(--surface-subtle);
    color: var(--text);
  }

  .indicator {
    position: absolute;

    left: 0;
    top: 10px;
    bottom: 10px;

    width: 2px;

    background: transparent;
  }

  a.active {
    color: var(--text);
    background: var(--accent-soft);
  }

  a.active .indicator {
    background: var(--accent);
  }

  .nav-label {
    flex: 1;
  }

  .nav-code {
    font-size: 0.62rem;
    color: var(--text-faint);
    letter-spacing: 0.08em;
  }

  a.active .nav-code {
    color: var(--accent);
  }

  @media (max-width: 800px) {
    .nav {
      padding: var(--space-2);

      overflow-x: auto;
    }

    .nav-heading {
      display: none;
    }

    .nav-items {
      flex-direction: row;

      width: max-content;
    }

    a {
      min-height: 38px;
      padding-inline: var(--space-4);
    }

    .indicator {
      top: auto;
      bottom: 0;

      left: var(--space-4);
      right: var(--space-4);

      width: auto;
      height: 2px;
    }

    .nav-code {
      display: none;
    }
  }
</style>
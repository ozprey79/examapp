<script>
  let {
    mode = 'student',
    userLabel = 'USER',
    onSignOut = undefined
  } = $props();
</script>

<header class="topbar">
  <div class="brand">
    <span class="brand-mark"></span>

    <div>
      <p class="system-name">
        EXAM SYSTEM
      </p>

      <p class="system-mode">
        / {mode.toUpperCase()}
      </p>
    </div>
  </div>

  <div class="user-area">
    <span class="user-label">
      {userLabel}
    </span>

    {#if onSignOut}
      <button
        class="signout"
        type="button"
        onclick={onSignOut}
      >
        SIGN OUT
      </button>
    {/if}
  </div>
</header>

<style>
  .topbar {
    height: 64px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 var(--space-6);

    background: var(--surface);

    border-bottom: 1px solid var(--border);

    font-family:
      var(--font-ui);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .brand-mark {
    width: 5px;
    height: 30px;

    background: var(--accent);

    clip-path: polygon(
      0 0,
      100% 0,
      100% 72%,
      50% 100%,
      0 72%
    );
  }

  .brand p {
    margin: 0;
  }

  .system-name {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  .system-mode {
    margin-top: 2px !important;

    font-size: 0.68rem;
    color: var(--text-muted);
    letter-spacing: 0.12em;
  }

  .user-area {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .user-label {
    max-width: 240px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: var(--text-xs);
    color: var(--text-muted);
    letter-spacing: 0.08em;
  }

  .signout {
    padding: 7px 10px;

    background: transparent;
    color: var(--text-muted);

    border: 1px solid transparent;
    border-radius: var(--radius-sm);

    font-size: 0.7rem;
    font-weight: 650;
    letter-spacing: 0.08em;
  }

  .signout:hover {
    color: var(--text);
    border-color: var(--border);
    background: var(--surface-subtle);
  }

  @media (max-width: 700px) {
    .topbar {
      height: 58px;
      padding-inline: var(--space-4);
    }

    .user-label {
      display: none;
    }

    .system-mode {
      display: none;
    }
  }
</style>

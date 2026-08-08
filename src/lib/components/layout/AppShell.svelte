<script>
  import TopBar from './TopBar.svelte';
  import SideNav from './SideNav.svelte';

  let {
    children,
    mode = 'student',
    userLabel = 'USER',
    navigation = [],
    currentPath = '',
    onSignOut = undefined
  } = $props();
</script>

<div class="app-shell">
  <TopBar
    {mode}
    {userLabel}
    {onSignOut}
  />

  <div class="shell-body">
    <aside class="sidebar">
      <SideNav
        items={navigation}
        {currentPath}
      />
    </aside>

    <main class="main">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .app-shell {
    min-height: 100vh;
    background: var(--bg);
  }

  .shell-body {
    min-height: calc(100vh - 64px);

    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .sidebar {
    background: var(--surface);

    border-right: 1px solid var(--border);
  }

  .main {
    min-width: 0;
  }

  @media (max-width: 800px) {
    .shell-body {
      min-height: calc(100vh - 58px);

      display: flex;
      flex-direction: column;
    }

    .sidebar {
      border-right: 0;
      border-bottom: 1px solid var(--border);
    }

    .main {
      flex: 1;
    }
  }
</style>
<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Database Test</title>
</svelte:head>

<h1>PostgreSQL Connection Test</h1>

{#if data.connected}
  <p>
    Database connection successful.
  </p>

  <dl>
    <dt>Database</dt>
    <dd>
      {data.connection.database_name}
    </dd>

    <dt>User</dt>
    <dd>
      {data.connection.database_user}
    </dd>

    <dt>Database time</dt>
    <dd>
      {new Date(
        data.connection.database_time
      ).toLocaleString()}
    </dd>
  </dl>
{:else}
  <p>
    {data.error}
  </p>
{/if}
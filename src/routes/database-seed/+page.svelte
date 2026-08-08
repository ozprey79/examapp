<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Database Seed</title>
</svelte:head>

<h1>Database Seed</h1>

{#if data.success}
  <p>
    Test data seeded successfully.
  </p>

  <dl>
    <dt>Test ID</dt>

    <dd>
      {data.result.testId}
    </dd>

    <dt>Questions inserted or updated</dt>

    <dd>
      {data.result.questionCount}
    </dd>
  </dl>
{:else}
  <p>
    Database seed failed.
  </p>

  <pre>{data.error}</pre>
{/if}
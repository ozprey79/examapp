<script>
  import AttemptCard from '$lib/components/results/AttemptCard.svelte';

  let {
    data
  } = $props();
</script>


<svelte:head>
  <title>Result History</title>
</svelte:head>


<h1>Result History</h1>

{#if data.attempts.length === 0}
  <p>
    No completed attempts found.
  </p>
{:else}
  <section aria-label="Completed attempts">
    {#each data.attempts as attempt
      (attempt.id)}
      <AttemptCard
        {attempt}
      />
    {/each}
  </section>
{/if}

<a href="/">
  Return to test
</a>

<style>
  :global(body) {
    background: var(--bg);
    color: var(--text);
  }

  h1,
  section,
  p,
  a {
    width: min(
      calc(100% - 32px),
      var(--page-width)
    );

    margin-inline: auto;
  }

  h1 {
    margin-top: var(--space-6);
    margin-bottom: var(--space-4);

    color: var(--primary);

    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
  }

  section {
    display: grid;
    gap: 10px;

    margin-bottom: var(--space-6);
  }

  p {
    margin-top: 0;
    margin-bottom: var(--space-6);

    padding: var(--space-4);

    background: var(--surface);
    color: var(--text-muted);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  a {
    display: inline-flex;
    align-items: center;

    width: fit-content;
    min-height: 38px;

    margin-bottom: var(--space-8);

    padding:
      0
      var(--space-3);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
  }

  a:hover {
    background: var(--surface-hover);
    border-color: var(--primary);
  }

  @media (max-width: 600px) {
    h1,
    section,
    p,
    a {
      width: calc(100% - 20px);
    }

    h1 {
      margin-top: var(--space-4);

      font-size: 20px;
    }

    a {
      width: auto;
      justify-content: center;
    }
  }
</style>


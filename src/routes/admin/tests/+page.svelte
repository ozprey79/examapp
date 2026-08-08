<script>
  let {
    data
  } = $props();


  function formatDate(
    value
  ) {
    return new Date(
      value
    ).toLocaleString();
  }
</script>


<svelte:head>
  <title>
    Test Management
  </title>
</svelte:head>


<p>
  <a href="/admin">
    ← Back to Admin Dashboard
  </a>
</p>


<h1>
  Test Management
</h1>


<p>
  <a href="/question-import">
    Import Question Bank
  </a>
</p>


{#if data.tests.length === 0}

  <p>
    No tests found.
  </p>

{:else}

  <table>
    <thead>
      <tr>
        <th>
          Test
        </th>

        <th>
          Questions
        </th>

        <th>
          Duration
        </th>

        <th>
          Correct
        </th>

        <th>
          Wrong
        </th>

        <th>
          Updated
        </th>
      </tr>
    </thead>


    <tbody>

      {#each data.tests as test}

        <tr>
          <td>
            <a
              href={`/admin/tests/${test.id}`}
            >
              {test.title}
            </a>
          </td>

          <td>
            {test.questionCount}
          </td>

          <td>
            {test.durationMinutes}
            min
          </td>

          <td>
            {test.correctMarks}
          </td>

          <td>
            {test.wrongMarks}
          </td>

          <td>
            {formatDate(
              test.updatedAt
            )}
          </td>
        </tr>

      {/each}

    </tbody>
  </table>

{/if}
<script>
  let {
    data
  } = $props();


  function formatScore(
    value
  ) {
    return Number(
      value
    ).toFixed(2);
  }


  function formatDate(
    value
  ) {
    return new Date(
      value
    ).toLocaleString();
  }


  function formatDuration(
    milliseconds
  ) {
    const totalSeconds =
      Math.round(
        milliseconds / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${minutes} min ${seconds} sec`;
  }
</script>


<svelte:head>
  <title>
    {data.student.name}
  </title>
</svelte:head>


<p>
  <a href="/admin">
    ← Back to Admin Dashboard
  </a>
</p>


<h1>
  {data.student.name}
</h1>

<p>
  {data.student.email}
</p>


<h2>
  Attempt History
</h2>


{#if data.attempts.length === 0}

  <p>
    No attempts completed yet.
  </p>

{:else}

  <table>
    <thead>
      <tr>
        <th>
          Test
        </th>

        <th>
          Date
        </th>

        <th>
          Score
        </th>

        <th>
          Correct
        </th>

        <th>
          Wrong
        </th>

        <th>
          Skipped
        </th>

        <th>
          Duration
        </th>
      </tr>
    </thead>

    <tbody>

      {#each data.attempts as attempt}

        <tr>
          <td>
  <a
    href={`/admin/students/${data.student.id}/attempts/${attempt.id}`}
  >
    {attempt.testTitle}
  </a>
</td>

          <td>
            {formatDate(
              attempt.completedAt
            )}
          </td>

          <td>
            {formatScore(
              attempt.score
            )}
          </td>

          <td>
            {attempt.correct}
          </td>

          <td>
            {attempt.wrong}
          </td>

          <td>
            {attempt.skipped}
          </td>

          <td>
            {formatDuration(
              attempt.durationMilliseconds
            )}
          </td>
        </tr>

      {/each}

    </tbody>
  </table>

{/if}
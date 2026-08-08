<script>
  import SignOutButton
    from '$lib/components/auth/SignOutButton.svelte';

  let {
    data
  } = $props();


  function formatScore(
    score
  ) {
    if (score === null) {
      return '—';
    }

    return Number(
      score
    ).toFixed(2);
  }


  function formatDate(
    value
  ) {
    if (!value) {
      return 'No attempts yet';
    }

    return new Date(
      value
    ).toLocaleString();
  }
</script>


<svelte:head>
  <title>
    Admin Dashboard
  </title>
</svelte:head>


<h1>
  Admin Dashboard
</h1>

<p>
  Signed in as:
  {data.user.email}
</p>

<p>
  <a href="/admin/tests">
    Manage Tests
  </a>
</p>
<p>
  <a href="/question-import">
    Import questions
  </a>
</p>

<SignOutButton />


<hr />


<h2>
  Student Progress
</h2>


{#if data.students.length === 0}

  <p>
    No student accounts found.
  </p>

{:else}

  <table>
    <thead>
      <tr>
        <th>
          Student
        </th>

        <th>
          Email
        </th>

        <th>
          Attempts
        </th>

        <th>
          Latest
        </th>

        <th>
          Best
        </th>

        <th>
          Average
        </th>

        <th>
          Last Attempt
        </th>
      </tr>
    </thead>

    <tbody>
      {#each data.students as student}

        <tr>
          <td>
  <a
    href={`/admin/students/${student.userId}`}
  >
    {student.name}
  </a>
</td>

          <td>
            {student.email}
          </td>

          <td>
            {student.attemptCount}
          </td>

          <td>
            {formatScore(
              student.latestScore
            )}
          </td>

          <td>
            {formatScore(
              student.bestScore
            )}
          </td>

          <td>
            {formatScore(
              student.averageScore
            )}
          </td>

          <td>
            {formatDate(
              student.lastAttemptAt
            )}
          </td>
        </tr>

      {/each}
    </tbody>
  </table>

{/if}
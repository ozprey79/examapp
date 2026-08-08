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


  function optionText(
    options,
    index
  ) {
    if (
      index === null ||
      index === undefined
    ) {
      return 'Skipped';
    }

    return (
      options?.[index] ??
      `Option ${index + 1}`
    );
  }


  function optionLabel(
    index
  ) {
    if (
      index === null ||
      index === undefined
    ) {
      return '';
    }

    return String.fromCharCode(
      65 + index
    );
  }
</script>


<svelte:head>
  <title>
    Attempt Details
  </title>
</svelte:head>


<p>
  <a
    href={`/admin/students/${data.attempt.userId}`}
  >
    ← Back to Student
  </a>
</p>


<h1>
  Attempt Details
</h1>


<p>
  Test:
  {data.attempt.testTitle}
</p>

<p>
  Completed:
  {formatDate(
    data.attempt.completedAt
  )}
</p>

<p>
  Score:
  {formatScore(
    data.attempt.score
  )}
</p>

<p>
  Correct:
  {data.attempt.correct}
</p>

<p>
  Wrong:
  {data.attempt.wrong}
</p>

<p>
  Skipped:
  {data.attempt.skipped}
</p>

<p>
  Duration:
  {formatDuration(
    data.attempt.durationMilliseconds
  )}
</p>


<hr />


<h2>
  Question Analysis
</h2>


{#each data.attempt.answers as answer}

  <section>
    <h3>
      Question
      {answer.questionNumber}
    </h3>


    <p>
      {answer.questionText}
    </p>


    <p>
      <strong>
        Selected:
      </strong>

      {#if answer.selectedAnswer === null}
        Skipped
      {:else}
        {optionLabel(
          answer.selectedAnswer
        )}.

        {optionText(
          answer.options,
          answer.selectedAnswer
        )}
      {/if}
    </p>


    <p>
      <strong>
        Correct:
      </strong>

      {optionLabel(
        answer.correctAnswer
      )}.

      {optionText(
        answer.options,
        answer.correctAnswer
      )}
    </p>


    <p>
      <strong>
        Status:
      </strong>

      {answer.status}
    </p>


    <p>
      <strong>
        Time:
      </strong>

      {formatDuration(
        answer.timeMilliseconds
      )}
    </p>


    {#if answer.explanation}
      <p>
        <strong>
          Explanation:
        </strong>

        {answer.explanation}
      </p>
    {/if}
  </section>

  <hr />

{/each}
<script>
  let {
    data
  } = $props();


  function optionLabel(
    index
  ) {
    return String.fromCharCode(
      65 + index
    );
  }
</script>


<svelte:head>
  <title>
    {data.test.title}
  </title>
</svelte:head>


<p>
  <a href="/admin/tests">
    ← Back to Tests
  </a>
</p>


<h1>
  {data.test.title}
</h1>


<p>
  Test ID:
  {data.test.id}
</p>

<p>
  Duration:
  {data.test.durationMinutes}
  minutes
</p>

<p>
  Correct marks:
  {data.test.correctMarks}
</p>

<p>
  Wrong marks:
  {data.test.wrongMarks}
</p>

<p>
  Skipped marks:
  {data.test.skippedMarks}
</p>

<p>
  Questions:
  {data.test.questions.length}
</p>


<hr />


<h2>
  Questions
</h2>
<p>
  <a
    href={`/admin/tests/${data.test.id}/edit`}
  >
    Edit Test
  </a>
</p>

{#each data.test.questions as question}

  <section>

    <h3>
      {question.position}.
      {question.module}
      —
      {question.topic}
    </h3>
    <p>
  <a
    href={`/admin/tests/${data.test.id}/questions/${question.id}/edit`}
  >
    Edit Question
  </a>
</p>

    <p>
      Difficulty:
      {question.difficulty}
    </p>


    <p>
      {question.text}
    </p>


    <ol type="A">

      {#each question.options as option}

        <li>
          {option}
        </li>

      {/each}

    </ol>


    <p>
      <strong>
        Correct Answer:
      </strong>

      {optionLabel(
        question.correctAnswer
      )}.

      {question.options[
        question.correctAnswer
      ]}
    </p>


    {#if question.explanation}

      <p>
        <strong>
          Explanation:
        </strong>

        {question.explanation}
      </p>

    {/if}

  </section>

  <hr />

{/each}
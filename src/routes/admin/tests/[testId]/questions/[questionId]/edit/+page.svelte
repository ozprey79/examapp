<script>
  let {
    data,
    form
  } = $props();


  const values =
    $derived(
      form?.values ?? {
        module:
          data.question.module,

        topic:
          data.question.topic,

        difficulty:
          data.question.difficulty,

        questionText:
          data.question.text,

        optionsText:
          data.question.options.join(
            '\n'
          ),

        correctAnswer:
          data.question.correctAnswer,

        explanation:
          data.question.explanation
      }
    );
</script>


<svelte:head>
  <title>
    Edit Question
  </title>
</svelte:head>


<p>
  <a
    href={`/admin/tests/${data.question.testId}`}
  >
    ← Cancel
  </a>
</p>


<h1>
  Edit Question
  {data.question.position}
</h1>


{#if form?.error}
  <p>
    {form.error}
  </p>
{/if}


<form method="POST">

  <p>
    <label>
      Module

      <br />

      <input
        name="module"
        value={values.module}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Topic

      <br />

      <input
        name="topic"
        value={values.topic}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Difficulty (0 to 1)

      <br />

      <input
        type="number"
        name="difficulty"
        min="0"
        max="1"
        step="0.001"
        value={values.difficulty}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Question

      <br />

      <textarea
        name="questionText"
        rows="5"
        cols="80"
        required
      >{values.questionText}</textarea>
    </label>
  </p>


  <p>
    <label>
      Options
      — one option per line

      <br />

      <textarea
        name="options"
        rows="8"
        cols="80"
        required
      >{values.optionsText}</textarea>
    </label>
  </p>


  <p>
    <label>
      Correct answer index

      <br />

      <input
        type="number"
        name="correctAnswer"
        min="0"
        step="1"
        value={values.correctAnswer}
        required
      />
    </label>
  </p>


  <p>
    Current convention:
    0 = A,
    1 = B,
    2 = C,
    3 = D
  </p>


  <p>
    <label>
      Explanation

      <br />

      <textarea
        name="explanation"
        rows="5"
        cols="80"
      >{values.explanation}</textarea>
    </label>
  </p>


  <button type="submit">
    Save Question
  </button>

</form>
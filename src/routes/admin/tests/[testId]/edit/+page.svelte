<script>
  let {
    data,
    form
  } = $props();


  const values =
    $derived(
      form?.values ?? {
        title:
          data.test.title,

        durationMinutes:
          data.test.durationMinutes,

        correctMarks:
          data.test.correctMarks,

        wrongMarks:
          data.test.wrongMarks,

        skippedMarks:
          data.test.skippedMarks
      }
    );
</script>


<svelte:head>
  <title>
    Edit {data.test.title}
  </title>
</svelte:head>


<p>
  <a
    href={`/admin/tests/${data.test.id}`}
  >
    ← Cancel
  </a>
</p>


<h1>
  Edit Test
</h1>


{#if form?.error}
  <p>
    {form.error}
  </p>
{/if}


<form method="POST">

  <p>
    <label>
      Title

      <br />

      <input
        name="title"
        value={values.title}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Duration in minutes

      <br />

      <input
        type="number"
        name="durationMinutes"
        min="1"
        step="1"
        value={values.durationMinutes}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Correct marks

      <br />

      <input
        type="number"
        name="correctMarks"
        step="0.01"
        value={values.correctMarks}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Wrong marks

      <br />

      <input
        type="number"
        name="wrongMarks"
        step="0.01"
        value={values.wrongMarks}
        required
      />
    </label>
  </p>


  <p>
    <label>
      Skipped marks

      <br />

      <input
        type="number"
        name="skippedMarks"
        step="0.01"
        value={values.skippedMarks}
        required
      />
    </label>
  </p>


  <button type="submit">
    Save Changes
  </button>

</form>
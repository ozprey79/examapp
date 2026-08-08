<script>
  let {
    form
  } = $props();
</script>


<svelte:head>
  <title>
    Question Import
  </title>
</svelte:head>


<h1>
  Question Import
</h1>

<p>
  Paste a complete question-bank JSON below.
</p>


<form method="POST">
  <textarea
    name="questionBank"
    rows="24"
    cols="90"
    required
  ></textarea>

  <br />

  <button type="submit">
    Import Question Bank
  </button>
</form>


{#if form?.error}
  <p>
    {form.error}
  </p>
{/if}


{#if form?.success}
  <h2>
    Import completed
  </h2>

  <p>
    Test ID:
    {form.result.testId}
  </p>

  <p>
    Received:
    {form.result.receivedCount}
  </p>

  <p>
    Inserted:
    {form.result.insertedCount}
  </p>

  <p>
    Updated:
    {form.result.updatedCount}
  </p>
{/if}
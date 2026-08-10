<script>
  import RevisionQuestionPlayer
    from '$lib/components/revision/RevisionQuestionPlayer.svelte';

  let {
    data
  } = $props();
</script>


<svelte:head>
  <title>
    Saved Practice
  </title>
</svelte:head>


<RevisionQuestionPlayer
  questions={data.savedQuestions}

  title="Saved Questions"

  eyebrow="Saved Practice"

  backHref="/student/saved"

  exitLabel="Exit Practice"

  completeTitle="Saved practice complete"

  completeLabel="Back to Saved Questions"

  finishLabel="Finish Practice"
/>
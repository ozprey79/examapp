<script>
  import RevisionQuestionPlayer
    from '$lib/components/revision/RevisionQuestionPlayer.svelte';

  let {
    data
  } = $props();
</script>


<RevisionQuestionPlayer
  questions={data.questions}
  title={data.title}
  backHref="/student/revision/practice"
/>
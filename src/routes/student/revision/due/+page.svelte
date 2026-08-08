<script>
  import RevisionQuestionPlayer
    from '$lib/components/revision/RevisionQuestionPlayer.svelte';

  let {
    data
  } = $props();
</script>


<RevisionQuestionPlayer
  questions={data.questions}
  title="Due Review"
  backHref="/student/revision"
/>
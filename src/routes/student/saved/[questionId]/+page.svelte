<script>
  import QuestionCard
    from '$lib/components/exam/QuestionCard.svelte';

  let {
    data
  } = $props();


  const raw =
    data.question;


  const question = {
    id:
      raw.id,

    m:
      raw.module ??
      raw.m ??
      '',

    s:
      raw.topic ??
      raw.s ??
      '',

    t:
      raw.question_text ??
      raw.text ??
      raw.t ??
      '',

    o:
      raw.options ??
      raw.o ??
      []
  };
</script>


<svelte:head>
  <title>Saved Question</title>
</svelte:head>


<main class="saved-question-page">

  <header class="page-header">

    <div>
      <p class="eyebrow">
        Student / Saved
      </p>

      <h1>
        Saved Question
      </h1>
    </div>


    <a
      href="/student/saved"
      class="back-link"
    >
      Saved Questions
    </a>

  </header>


  <QuestionCard
    {question}
    mode="practice"
  />

</main>


<style>
  .saved-question-page {
    width:
      min(
        calc(
          100% -
          var(--space-8)
        ),
        var(--page-width)
      );

    margin-inline:
      auto;

    padding-block:
      var(--page-padding);
  }


  .page-header {
    display:
      flex;

    justify-content:
      space-between;

    align-items:
      flex-start;

    gap:
      var(--space-4);

    margin-bottom:
      var(--space-6);

    padding-bottom:
      var(--space-4);

    border-bottom:
      1px solid
      var(--border);
  }


  .eyebrow {
    margin:
      0 0
      var(--space-2);

    color:
      var(--text-muted);
  }


  h1 {
    margin:
      0;
  }


  .back-link {
    padding:
      var(--space-2)
      var(--space-3);

    color:
      var(--text);

    text-decoration:
      none;

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);
  }


  .back-link:hover {
    background-color:
      var(--surface-hover);
  }
</style>
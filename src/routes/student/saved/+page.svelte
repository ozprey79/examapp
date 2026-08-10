<script>
  let {
    data
  } = $props();

  const questions =
    data.savedQuestions;


  function getModule(
    question
  ) {
    return (
      question.module ??
      question.m ??
      'Question'
    );
  }


  function getTopic(
    question
  ) {
    return (
      question.topic ??
      question.s ??
      ''
    );
  }


  function getText(
    question
  ) {
    return (
      question.question_text ??
      question.text ??
      question.t ??
      'Question'
    );
  }
</script>


<svelte:head>
  <title>Saved Questions</title>
</svelte:head>


<main class="saved-page">

  <header class="page-header">

    <div>
      <p class="eyebrow">
        Student / Saved
      </p>

      <h1>
        Saved Questions
      </h1>

      <p class="saved-count">
        {questions.length}
        {questions.length === 1
          ? 'question'
          : 'questions'}
        saved
      </p>
    </div>


    <a
      class="dashboard-link"
      href="/student"
    >
      Dashboard
    </a>
    <a
  class="practice-link"
  href="/student/saved/practice"
>
  Practice Saved
</a>

  </header>
  <div class="header-actions">

  {#if questions.length > 0}
    <a
      class="practice-link"
      href="/student/saved/practice"
    >
      Practice Saved
    </a>
  {/if}

  <a
    class="dashboard-link"
    href="/student"
  >
    Dashboard
  </a>

</div>


  {#if questions.length === 0}

    <section class="empty-state">

      <p>
        No saved questions yet.
      </p>

      <p class="muted">
        Use the bookmark button on a question
        to save it for later.
      </p>

    </section>

  {:else}

    <section
      class="saved-list"
      aria-label="Saved questions"
    >

      {#each questions as question, index}

        <article class="saved-row">

          <div class="question-number">
            {String(index + 1).padStart(
              2,
              '0'
            )}
          </div>


          <div class="question-info">

            <div class="question-meta">

              <span>
                {getModule(
                  question
                )}
              </span>

              {#if getTopic(question)}

                <span class="meta-divider">
                  /
                </span>

                <span>
                  {getTopic(
                    question
                  )}
                </span>

              {/if}

            </div>


            <h2>
              {getText(
                question
              )}
            </h2>

          </div>


          <div class="question-actions">

            <a
              href={`/student/saved/${question.question_id}`}
            >
              Open
            </a>

          </div>

        </article>

      {/each}

    </section>

  {/if}

</main>


<style>
  .saved-page {
    width:
      min(
        calc(100% - var(--space-8)),
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
      var(--space-6);

    padding-bottom:
      var(--space-6);

    border-bottom:
      1px solid
      var(--border);
  }


  .eyebrow,
  .saved-count,
  .question-meta {
    color:
      var(--text-muted);
  }


  .eyebrow {
    margin:
      0 0 var(--space-2);
  }


  h1 {
    margin:
      0;
  }


  .saved-count {
    margin:
      var(--space-2) 0 0;
  }


  .dashboard-link {
    flex:
      0 0 auto;

    padding:
      var(--space-2)
      var(--space-3);

    text-decoration:
      none;

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);
  }


  .dashboard-link:hover {
    background-color:
      var(--surface-hover);
  }


  .empty-state {
    padding-block:
      var(--space-8);
  }


  .empty-state p {
    margin:
      0;
  }


  .empty-state .muted {
    margin-top:
      var(--space-2);
  }


  .saved-list {
    border-bottom:
      1px solid
      var(--border);
  }


  .saved-row {
    display:
      grid;

    grid-template-columns:
      auto minmax(0, 1fr) auto;

    align-items:
      center;

    gap:
      var(--space-4);

    padding:
      var(--space-4) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .saved-row:last-child {
    border-bottom:
      0;
  }


  .question-number {
    color:
      var(--text-muted);
  }


  .question-info {
    min-width:
      0;
  }


  .question-meta {
    display:
      flex;

    flex-wrap:
      wrap;

    gap:
      var(--space-2);

    margin-bottom:
      var(--space-2);
  }


  .meta-divider {
    color:
      var(--border);
  }


  .question-info h2 {
    margin:
      0;

    font-size:
      var(--font-size-base);

    font-weight:
      600;

    line-height:
      1.5;
  }


  .question-actions a {
    display:
      inline-flex;

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


  .question-actions a:hover {
    background-color:
      var(--surface-hover);
  }
  .header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.practice-link,
.dashboard-link {
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

.practice-link:hover,
.dashboard-link:hover {
  background-color:
    var(--surface-hover);
}


  @media (
    max-width: 640px
  ) {

    .saved-row {
      grid-template-columns:
        auto minmax(0, 1fr);
    }


    .question-actions {
      grid-column:
        2;
    }

  }
</style>
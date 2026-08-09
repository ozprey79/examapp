<script>
  import QuestionCard
    from '$lib/components/exam/QuestionCard.svelte';

  import QuestionNavigator
    from '$lib/components/exam/QuestionNavigator.svelte';


  let { data } = $props();


  const attempt =
    data.attempt;

  const answers =
    attempt.answers;


  let currentIndex =
    $state(0);


  const answer =
    $derived(
      answers[currentIndex]
    );


  const question =
    $derived({
      id:
        answer?.questionId,

      m:
        answer?.module,

      s:
        answer?.topic,

      t:
        answer?.questionText,

      o:
        answer?.options ?? []
    });


  const isFirst =
    $derived(
      currentIndex === 0
    );


  const isLast =
    $derived(
      currentIndex ===
        answers.length - 1
    );


  function goToQuestion(
    index
  ) {
    if (
      index < 0 ||
      index >= answers.length ||
      index === currentIndex
    ) {
      return;
    }

    currentIndex =
      index;
  }


  function previousQuestion() {
    if (isFirst) {
      return;
    }

    currentIndex -= 1;
  }


  function nextQuestion() {
    if (isLast) {
      window.location.href =
        `/student/results/${attempt.id}`;

      return;
    }

    currentIndex += 1;
  }


  function optionLetter(
    index
  ) {
    if (
      index === null ||
      index === undefined
    ) {
      return '—';
    }

    return String.fromCharCode(
      65 + index
    );
  }


  function statusLabel(
    status
  ) {
    if (
      status === 'correct'
    ) {
      return 'Correct';
    }

    if (
      status === 'wrong'
    ) {
      return 'Incorrect';
    }

    return 'Skipped';
  }


  function formatTime(
    milliseconds
  ) {
    if (
      !Number.isFinite(
        milliseconds
      )
    ) {
      return '—';
    }


    const totalSeconds =
      Math.round(
        milliseconds /
        1000
      );


    if (
      totalSeconds < 60
    ) {
      return `${totalSeconds}s`;
    }


    const minutes =
      Math.floor(
        totalSeconds /
        60
      );

    const seconds =
      totalSeconds %
      60;


    return (
      `${minutes}m ` +
      `${seconds}s`
    );
  }
</script>


<svelte:head>
  <title>
    Review · {attempt.testTitle}
  </title>
</svelte:head>


<div class="review-page">

  <!-- =====================================================
       HEADER
  ====================================================== -->

  <header class="review-header">

    <div class="title-group">

      <p class="eyebrow">
        Question Review
      </p>


      <h1>
        {attempt.testTitle}
      </h1>


      <p class="review-summary">
        Question
        {currentIndex + 1}
        of
        {answers.length}
      </p>

    </div>


    <a
      class="back-result"
      href={`/student/results/${attempt.id}`}
    >
      ← Results
    </a>

  </header>



  <!-- =====================================================
       QUESTION NAVIGATOR
       Same component used by the mock
  ====================================================== -->

  <QuestionNavigator
    questions={answers}
    {currentIndex}
    mode="review"
    label="Question Review"
    onGoToQuestion={goToQuestion}
  />



  <!-- =====================================================
       QUESTION
       Same component used by the mock
  ====================================================== -->

  <QuestionCard
    mode="review"
    {question}
    selectedAnswer={
      answer.selectedAnswer
    }
    correctAnswer={
      answer.correctAnswer
    }
  />



  <!-- =====================================================
       REVIEW FEEDBACK
  ====================================================== -->

  <section
    class="feedback {answer.status}"
    aria-label="Answer feedback"
  >

    <div class="feedback-heading">

      <p class="feedback-kicker">
        Result
      </p>


      <h2>
        {statusLabel(
          answer.status
        )}
      </h2>

    </div>



    <div class="feedback-facts">

      <div>

        <span>
          Your answer
        </span>

        <strong>
          {optionLetter(
            answer.selectedAnswer
          )}
        </strong>

      </div>


      <div>

        <span>
          Correct answer
        </span>

        <strong>
          {optionLetter(
            answer.correctAnswer
          )}
        </strong>

      </div>


      <div>

        <span>
          Time used
        </span>

        <strong>
          {formatTime(
            answer.timeMilliseconds
          )}
        </strong>

      </div>


      <div>

        <span>
          Difficulty
        </span>

        <strong>
          {answer.difficulty ??
            '—'}
        </strong>

      </div>

    </div>



    {#if answer.explanation}

      <div class="explanation">

        <span class="explanation-label">
          Explanation
        </span>


        <p>
          {answer.explanation}
        </p>

      </div>

    {/if}

  </section>



  <!-- =====================================================
       REVIEW CONTROLS
       Styled like mock-test controls
  ====================================================== -->

  <footer class="review-controls">

    <button
      type="button"
      class="control-button secondary-button"
      onclick={previousQuestion}
      disabled={isFirst}
    >
      ← Previous
    </button>


    <span class="control-position">
      Question
      {currentIndex + 1}
      of
      {answers.length}
    </span>


    <button
      type="button"
      class="control-button primary-button"
      onclick={nextQuestion}
    >
      {isLast
        ? 'Back to Results'
        : 'Next Question →'}
    </button>

  </footer>

</div>


<style>

  /* ======================================================
     PAGE
  ====================================================== */

  .review-page {
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

    padding:
      var(--space-6)
      0
      var(--space-8);

    display:
      grid;

    gap:
      var(--space-4);
  }



  /* ======================================================
     HEADER
  ====================================================== */

  .review-header {
    display:
      flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    margin-bottom:
      var(--space-1);
  }


  .title-group {
    min-width: 0;
  }


  .eyebrow {
    margin:
      0
      0
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      11px;

    font-weight:
      600;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  h1 {
    margin: 0;

    color:
      var(--primary);

    font-size:
      20px;

    line-height:
      1.3;

    font-weight:
      600;
  }


  .review-summary {
    margin:
      var(--space-1)
      0
      0;

    color:
      var(--text-muted);

    font-size:
      13px;
  }



  /* ======================================================
     BACK TO RESULT
  ====================================================== */

  .back-result {
    flex:
      0
      0
      auto;

    min-height:
      40px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0
      var(--space-4);

    background:
      var(--surface);

    color:
      var(--text);

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);

    font-size:
      13px;

    font-weight:
      600;

    text-decoration:
      none;
  }


  .back-result:hover {
    background:
      var(--surface-hover);

    border-color:
      var(--primary);
  }



  /* ======================================================
     FEEDBACK
  ====================================================== */

  .feedback {
    overflow:
      hidden;

    background:
      var(--surface);

    color:
      var(--text);

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);
  }


  .feedback.correct {
    border-color:
      var(--success);
  }


  .feedback.wrong {
    border-color:
      var(--danger);
  }


  .feedback.skipped {
    border-color:
      var(--warning);
  }



  /* ------------------------------------------------------
     Feedback title
  ------------------------------------------------------ */

  .feedback-heading {
    padding:
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .feedback-kicker {
    margin:
      0
      0
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      11px;

    font-weight:
      600;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .feedback h2 {
    margin: 0;

    color:
      var(--text);

    font-size:
      16px;

    line-height:
      1.3;

    font-weight:
      600;
  }


  .feedback.correct h2 {
    color:
      var(--success);
  }


  .feedback.wrong h2 {
    color:
      var(--danger);
  }


  .feedback.skipped h2 {
    color:
      var(--warning);
  }



  /* ------------------------------------------------------
     Answer facts
  ------------------------------------------------------ */

  .feedback-facts {
    display:
      grid;

    grid-template-columns:
      repeat(
        4,
        minmax(
          0,
          1fr
        )
      );

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .feedback-facts > div {
    min-width: 0;

    display:
      grid;

    gap:
      var(--space-1);

    padding:
      var(--space-4);

    border-right:
      1px solid
      var(--border-soft);
  }


  .feedback-facts
    > div:last-child {
    border-right: 0;
  }


  .feedback-facts span {
    color:
      var(--text-muted);

    font-size:
      11px;
  }


  .feedback-facts strong {
    color:
      var(--text);

    font-size:
      14px;

    font-weight:
      700;

    font-variant-numeric:
      tabular-nums;
  }



  /* ------------------------------------------------------
     Explanation
  ------------------------------------------------------ */

  .explanation {
    padding:
      var(--space-4);
  }


  .explanation-label {
    display: block;

    color:
      var(--text-muted);

    font-size:
      11px;

    font-weight:
      600;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .explanation p {
    max-width:
      60rem;

    margin:
      var(--space-2)
      0
      0;

    color:
      var(--text);

    font-size:
      14px;

    line-height:
      1.6;
  }



  /* ======================================================
     CONTROLS
  ====================================================== */

  .review-controls {
    display:
      grid;

    grid-template-columns:
      1fr
      auto
      1fr;

    align-items:
      center;

    gap:
      var(--space-4);

    padding-top:
      var(--space-1);
  }


  .control-button {
    min-height:
      40px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0
      var(--space-4);

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);

    font:
      inherit;

    font-size:
      13px;

    font-weight:
      600;

    cursor:
      pointer;
  }



  /* ------------------------------------------------------
     Previous
  ------------------------------------------------------ */

  .secondary-button {
    justify-self:
      start;

    background:
      var(--surface);

    color:
      var(--text);
  }


  .secondary-button:hover:not(
    :disabled
  ) {
    background:
      var(--surface-hover);

    border-color:
      var(--primary);
  }



  /* ------------------------------------------------------
     Next
  ------------------------------------------------------ */

  .primary-button {
    justify-self:
      end;

    background:
      var(--primary);

    color:
      var(--primary-text);

    border-color:
      var(--primary);
  }


  .primary-button:hover {
    background:
      var(--primary-hover);
  }



  /* ------------------------------------------------------
     Disabled
  ------------------------------------------------------ */

  .control-button:disabled {
    opacity:
      0.35;

    cursor:
      not-allowed;
  }



  /* ------------------------------------------------------
     Position
  ------------------------------------------------------ */

  .control-position {
    color:
      var(--text-muted);

    font-size:
      12px;

    text-align:
      center;

    white-space:
      nowrap;
  }



  /* ======================================================
     MOBILE
  ====================================================== */

  @media (
    max-width: 700px
  ) {

    .review-page {
      width:
        calc(
          100% -
          var(--space-6)
        );

      padding-top:
        var(--space-4);
    }


    .review-header {
      flex-direction:
        column;

      gap:
        var(--space-3);
    }


    .back-result {
      align-self:
        flex-start;
    }


    .feedback-facts {
      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );
    }


    .feedback-facts
      > div:nth-child(2) {
      border-right: 0;
    }


    .feedback-facts
      > div:nth-child(-n + 2) {
      border-bottom:
        1px solid
        var(--border-soft);
    }


    .review-controls {
      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );
    }


    .control-position {
      grid-column:
        1 / -1;

      grid-row:
        1;
    }


    .secondary-button,
    .primary-button {
      width: 100%;

      justify-self:
        stretch;
    }

  }

</style>
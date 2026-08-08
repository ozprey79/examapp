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

  const isFirst =
    $derived(
      currentIndex === 0
    );

  const isLast =
    $derived(
      currentIndex ===
        answers.length - 1
    );

  function goToQuestion(index) {
    if (
      index < 0 ||
      index >= answers.length
    ) {
      return;
    }

    currentIndex = index;
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

  function optionLetter(index) {
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

  function statusLabel(status) {
    if (status === 'correct') {
      return 'Correct';
    }

    if (status === 'wrong') {
      return 'Incorrect';
    }

    return 'Skipped';
  }
</script>

<div class="review-page">
  <header class="review-header">
    <div>
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
      Back to Results
    </a>
  </header>

  <QuestionNavigator
    questions={answers}
    {currentIndex}
    mode="review"
    label="Question Review"
    onGoToQuestion={goToQuestion}
  />

  <QuestionCard
    mode="review"
    question={{
      m:
        answer.module,

      s:
        answer.topic,

      t:
        answer.questionText,

      o:
        answer.options
    }}
    selectedAnswer={
      answer.selectedAnswer
    }
    correctAnswer={
      answer.correctAnswer
    }
  />

  <section
    class="feedback {answer.status}"
    aria-label="Answer feedback"
  >
    <h2>
      {statusLabel(
        answer.status
      )}
    </h2>

    <div class="feedback-facts">
      <p>
        <span>
          Your answer
        </span>

        <strong>
          {optionLetter(
            answer.selectedAnswer
          )}
        </strong>
      </p>

      <p>
        <span>
          Correct answer
        </span>

        <strong>
          {optionLetter(
            answer.correctAnswer
          )}
        </strong>
      </p>
    </div>

    {#if answer.explanation}
      <div class="explanation">
        <strong>
          Explanation
        </strong>

        <p>
          {answer.explanation}
        </p>
      </div>
    {/if}
  </section>

  <footer class="review-controls">
    <button
      type="button"
      class="secondary"
      onclick={previousQuestion}
      disabled={isFirst}
    >
      ← Previous
    </button>

    <button
      type="button"
      class="primary"
      onclick={nextQuestion}
    >
      {isLast
        ? 'Back to Results'
        : 'Next Question →'}
    </button>
  </footer>
</div>

<style>
  .review-page {
    width: min(
      calc(
        100% -
        var(--space-8)
      ),
      var(--page-width)
    );

    margin-inline: auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    display: grid;
    gap: var(--space-4);
  }

  .review-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
  }

  .eyebrow {
    margin: 0 0 var(--space-1);

    color: var(--text-muted);

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;

    text-transform: uppercase;
  }

  h1 {
    margin: 0;

    color: var(--primary);

    font-size: 20px;
    line-height: 1.3;
    font-weight: 600;
  }

  .review-summary {
    margin: var(--space-1) 0 0;

    color: var(--text-muted);

    font-size: 13px;
  }

  .back-result,
  .review-controls button {
    min-height: 40px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 0 var(--space-4);

    border-radius: var(--radius);

    font-size: 12px;
    font-weight: 600;

    text-decoration: none;
  }

  .back-result,
  .review-controls .secondary {
    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
  }

  .back-result:hover,
  .review-controls
  .secondary:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: var(--primary);
  }

  .feedback {
    padding: var(--space-4);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .feedback.correct {
    border-color: var(--success);
  }

  .feedback.wrong {
    border-color: var(--danger);
  }

  .feedback.skipped {
    border-color: var(--warning);
  }

  .feedback h2 {
    margin: 0 0 var(--space-3);

    font-size: 16px;
    line-height: 1.3;
    font-weight: 600;
  }

  .feedback.correct h2 {
    color: var(--success);
  }

  .feedback.wrong h2 {
    color: var(--danger);
  }

  .feedback.skipped h2 {
    color: var(--warning);
  }

  .feedback-facts {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: var(--space-2);
  }

  .feedback-facts p {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);

    margin: 0;
    padding: var(--space-3);

    background: var(--surface-strong);

    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
  }

  .feedback-facts span {
    color: var(--text-muted);
    font-size: 12px;
  }

  .feedback-facts strong {
    color: var(--text);

    font-size: 14px;
    font-weight: 700;
  }

  .explanation {
    margin-top: var(--space-4);
    padding-top: var(--space-4);

    border-top: 1px solid var(--border-soft);
  }

  .explanation > strong {
    color: var(--text);

    font-size: 12px;
    font-weight: 700;
  }

  .explanation p {
    margin: var(--space-2) 0 0;

    color: var(--text-muted);

    font-size: 14px;
    line-height: 1.55;
  }

  .review-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .review-controls button:disabled {
    opacity: 0.35;
  }

  .review-controls .primary {
    background: var(--primary);
    color: var(--primary-text);

    border: 1px solid var(--primary);
  }

  .review-controls .primary:hover {
    background: var(--primary-hover);
  }

  @media (max-width: 600px) {
    .review-page {
      width:
        calc(
          100% -
          var(--space-6)
        );

      padding-top: var(--space-4);
    }

    .review-header {
      flex-direction: column;
      gap: var(--space-3);
    }

    .feedback-facts {
      grid-template-columns: 1fr;
    }

    .review-controls {
      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
    }

    .review-controls button {
      width: 100%;
    }
  }
</style>

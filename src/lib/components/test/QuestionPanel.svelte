<script>
  import AnswerOption
    from './AnswerOption.svelte';

  let {
    question,

    questionNumber = 1,
    totalQuestions = 1,

    selectedAnswer = null,

    locked = false,
    showCorrectness = false,

    markedForReview = false,

    isFirstQuestion = false,
    isLastQuestion = false,

    onSelectAnswer = undefined,
    onClear = undefined,
    onToggleReview = undefined,
    onPrevious = undefined,
    onPrimary = undefined
  } = $props();

  let primaryLabel = $derived.by(() => {
    if (locked) {
      return isLastQuestion
        ? 'Finish'
        : 'Next';
    }

    if (selectedAnswer === null) {
      return isLastQuestion
        ? 'Skip & Finish'
        : 'Skip & Next';
    }

    return isLastQuestion
      ? 'Submit & Finish'
      : 'Submit & Next';
  });
</script>

<section class="question-panel">

  <div class="question-meta">
    <span>
      Q{questionNumber}/{totalQuestions}
    </span>

    {#if question.module}
      <span>
        {question.module}
      </span>
    {/if}

    {#if question.topic}
      <span>
        {question.topic}
      </span>
    {/if}

    {#if question.difficulty}
      <span>
        {question.difficulty}
      </span>
    {/if}
  </div>

  <div class="question-body">

    <h2>
      {question.text}
    </h2>

    <div class="options">
      {#each question.options as option, index}

        <AnswerOption
          letter={String.fromCharCode(65 + index)}
          text={option}
          selected={selectedAnswer === index}
          correct={
            showCorrectness &&
            index === question.correctAnswer
          }
          wrong={
            showCorrectness &&
            selectedAnswer === index &&
            index !== question.correctAnswer
          }
          disabled={locked}
          onclick={() =>
            onSelectAnswer?.(index)}
        />

      {/each}
    </div>

    <div class="secondary-actions">

      <button
        type="button"
        class:review-active={markedForReview}
        onclick={onToggleReview}
      >
        {markedForReview
          ? 'Marked for review'
          : 'Mark for review'}
      </button>

      {#if selectedAnswer !== null && !locked}
        <button
          type="button"
          onclick={onClear}
        >
          Clear answer
        </button>
      {/if}

    </div>

  </div>

  <footer class="question-actions">

    <button
      type="button"
      class="previous"
      disabled={isFirstQuestion}
      onclick={onPrevious}
    >
      ← Previous
    </button>

    <span class="question-position">
      Question {questionNumber}
      of {totalQuestions}
    </span>

    <button
      type="button"
      class="primary"
      onclick={onPrimary}
    >
      {primaryLabel}
    </button>

  </footer>

</section>

<style>
  .question-panel {
    margin-top: 22px;

    overflow: hidden;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;

    padding: 10px 16px;

    color: var(--text-muted);

    border-bottom: 1px solid var(--border-soft);

    font-size: 12px;
  }

  .question-meta span:first-child {
    color: var(--primary);
    font-weight: 700;
  }

  .question-body {
    padding: 26px;
  }

  h2 {
    max-width: 780px;

    margin: 0 0 26px;

    font-family:
      var(--font-reading);

    font-size: 18px;
    line-height: 1.55;
    font-weight: 600;
  }

  .options {
    display: grid;
    gap: 10px;
  }

  .secondary-actions {
    display: flex;
    gap: 10px;

    margin-top: 18px;
  }

  .secondary-actions button {
    min-height: 36px;
    padding: 0 12px;

    background: transparent;
    color: var(--text-muted);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .secondary-actions button:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .secondary-actions .review-active {
    color: var(--warning);
    border-color: var(--warning);
  }

  .question-actions {
    display: grid;

    grid-template-columns:
      auto
      1fr
      auto;

    align-items: center;
    gap: 16px;

    padding: 14px 16px;

    border-top: 1px solid var(--border-soft);
  }

  .question-actions button {
    min-height: 42px;
    min-width: 110px;

    padding: 0 16px;

    border-radius: var(--radius);

    font-weight: 600;
  }

  .previous {
    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
  }

  .previous:hover:not(:disabled) {
    background: var(--surface-hover);
  }

  .previous:disabled {
    opacity: 0.35;
  }

  .primary {
    background: var(--primary);
    color: var(--primary-text);

    border: 1px solid var(--primary);

    font-weight: 700;
  }

  .primary:hover {
    background: var(--primary-hover);
  }

  .question-position {
    color: var(--text-muted);

    font-size: 12px;
    text-align: center;
  }

  @media (max-width: 600px) {
    .question-body {
      padding: 20px 16px;
    }

    h2 {
      font-size: 17px;
    }

    .question-actions {
      grid-template-columns: 1fr 1fr;
    }

    .question-position {
      display: none;
    }

    .question-actions button {
      width: 100%;
    }
  }
</style>

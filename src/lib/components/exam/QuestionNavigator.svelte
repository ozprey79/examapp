<script>
  let {
    questions = [],
    currentIndex = 0,
    getQuestionStatus = undefined,
    onGoToQuestion = undefined,

    mode = 'test',
    label = 'Questions'
  } = $props();

  function getStatus(
    question,
    index
  ) {
    if (getQuestionStatus) {
      return String(
        getQuestionStatus(
          question,
          index
        ) ?? 'open'
      ).toLowerCase();
    }

    return String(
      question.status ?? 'open'
    ).toLowerCase();
  }

  function displayStatus(status) {
    if (status === 'wrong') {
      return 'Incorrect';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }
</script>

<section
  class="navigator-section"
  aria-label={label}
>
  <div class="navigator-header">
    <span>{label}</span>

    <span class="position">
      {currentIndex + 1}
      / {questions.length}
    </span>
  </div>

  <div class="question-navigator">
    {#each questions as question, index}
      {@const status =
        getStatus(question, index)}

      <button
        type="button"
        class="question-dot"
        class:current={
          index === currentIndex
        }
        class:submitted={
          status === 'submitted'
        }
        class:correct={
          status === 'correct'
        }
        class:wrong={
          status === 'wrong'
        }
        class:skipped={
          status === 'skipped'
        }
        aria-label={`Question ${index + 1}: ${displayStatus(status)}`}
        title={`Question ${index + 1} — ${displayStatus(status)}`}
        onclick={() =>
          onGoToQuestion?.(index)}
      >
      </button>
    {/each}
  </div>

  <div class="legend">
    {#if mode === 'review'}
      <span>
        <i class="legend-dot correct"></i>
        Correct
      </span>

      <span>
        <i class="legend-dot wrong"></i>
        Incorrect
      </span>

      <span>
        <i class="legend-dot skipped"></i>
        Skipped
      </span>
    {:else}
      <span>
        <i class="legend-dot"></i>
        Open
      </span>

      <span>
        <i class="legend-dot submitted"></i>
        Submitted
      </span>

      <span>
        <i class="legend-dot skipped"></i>
        Skipped
      </span>
    {/if}

    <span>
      <i class="legend-dot current"></i>
      Current
    </span>
  </div>
</section>

<style>
  .navigator-section {
    padding: var(--space-3);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    font-family:
      var(--font-ui);
  }

  .navigator-header {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);

    margin-bottom: var(--space-3);

    font-size: 12px;
    font-weight: 600;
  }

  .position {
    color: var(--text-muted);
    font-weight: 400;
  }

  .question-navigator {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .question-dot {
    width: 15px;
    height: 15px;
    padding: 0;

    background: var(--surface-strong);

    border: 1px solid var(--border);
    border-radius: 50%;
  }

  .question-dot:hover {
    background: var(--surface-hover);
  }

  .question-dot.submitted,
  .question-dot.correct {
    background: var(--success);
    border-color: var(--success);
  }

  .question-dot.wrong {
    background: var(--danger);
    border-color: var(--danger);
  }

  .question-dot.skipped {
    background: var(--warning);
    border-color: var(--warning);
  }

  .question-dot.current {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);

    margin-top: var(--space-3);
    padding-top: var(--space-3);

    color: var(--text-muted);

    border-top: 1px solid var(--border-soft);

    font-size: 11px;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .legend-dot {
    width: 9px;
    height: 9px;

    display: inline-block;

    background: var(--surface-strong);

    border: 1px solid var(--border);
    border-radius: 50%;
  }

  .legend-dot.submitted,
  .legend-dot.correct {
    background: var(--success);
    border-color: var(--success);
  }

  .legend-dot.wrong {
    background: var(--danger);
    border-color: var(--danger);
  }

  .legend-dot.skipped {
    background: var(--warning);
    border-color: var(--warning);
  }

  .legend-dot.current {
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }
</style>

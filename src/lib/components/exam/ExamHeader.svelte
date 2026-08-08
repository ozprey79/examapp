<script>
  let {
    formattedTime,
    formattedQuestionTime,
    currentQuestionNumber,
    totalQuestions
  } = $props();
</script>

<header
  class="exam-header"
  aria-label="Exam status"
>
  <div class="status-box">
    <span class="label">
      Time left
    </span>

    <strong class="time">
      {formattedTime}
    </strong>
  </div>

  <div class="status-box">
    <span class="label">
      Question time
    </span>

    <strong class="time">
      {formattedQuestionTime}
    </strong>
  </div>

  <div class="status-box">
    <span class="label">
      Current question
    </span>

    <strong>
      {currentQuestionNumber}

      <span class="muted">
        / {totalQuestions}
      </span>
    </strong>
  </div>
</header>

<style>
  .exam-header {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    gap: 10px;

    margin-top: var(--space-4);
  }

  .status-box {
    min-height: 76px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 12px 14px;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .label {
    margin-bottom: 3px;

    color: var(--text-muted);
    font-size: 12px;
  }

  strong {
    font-size: 20px;
    line-height: 1.2;
  }

  .time {
    color: var(--primary);

    font-variant-numeric:
      tabular-nums;
  }

  .muted {
    color: var(--text-muted);

    font-size: 14px;
    font-weight: 400;
  }

  @media (max-width: 600px) {
    .exam-header {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .status-box:last-child {
      grid-column: span 2;
    }
  }

  @media (max-width: 420px) {
    .exam-header {
      grid-template-columns: 1fr;
    }

    .status-box:last-child {
      grid-column: auto;
    }
  }
</style>
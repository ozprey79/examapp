<script>
  let {
    score = null,
    correct = null,
    wrong = null,
    skipped = 0,
    remaining = 0,
    hidden = false
  } = $props();
</script>

<section class="score-strip">
  <div class="score-box">
    <strong>
      {hidden ? '—' : score}
    </strong>

    <span>
      {hidden ? 'Score hidden' : 'Score'}
    </span>
  </div>

  <div class="score-box correct">
    <strong>
      {hidden ? '—' : correct}
    </strong>

    <span>
      {hidden ? 'Correct hidden' : 'Correct'}
    </span>
  </div>

  <div class="score-box wrong">
    <strong>
      {hidden ? '—' : wrong}
    </strong>

    <span>
      {hidden ? 'Wrong hidden' : 'Wrong'}
    </span>
  </div>

  <div class="score-box skipped">
    <strong>{skipped}</strong>
    <span>Skipped</span>
  </div>

  <div class="score-box remaining">
    <strong>{remaining}</strong>
    <span>Remaining</span>
  </div>
</section>

<style>
  .score-strip {
    display: grid;
    grid-template-columns:
      repeat(5, minmax(0, 1fr));

    gap: 10px;

    margin-top: 18px;
  }

  .score-box {
    min-height: 76px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  strong {
    margin-bottom: 4px;

    font-size: 21px;
    line-height: 1;
  }

  span {
    color: var(--text-muted);
    font-size: 12px;
  }

  .correct strong {
    color: var(--success);
  }

  .wrong strong {
    color: var(--danger);
  }

  .skipped strong {
    color: var(--warning);
  }

  .remaining strong {
    color: var(--primary);
  }

  @media (max-width: 760px) {
    .score-strip {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .score-strip {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .score-box:last-child {
      grid-column: span 2;
    }
  }
</style>
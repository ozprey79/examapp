<script>
  let {
    timeLeft,
    elapsed,
    questionTime,
    questionStatus = 'On pace',
    paused = false,
    onPause = undefined,
    onFinish = undefined
  } = $props();
</script>

<section class="controls">
  <div class="stat-box">
    <span>Time left</span>
    <strong>{timeLeft}</strong>
  </div>

  <div class="stat-box">
    <span>Elapsed</span>
    <strong>{elapsed}</strong>
  </div>

  <div class="stat-box">
    <span>Current question</span>

    <strong class="success">
      {questionTime}
    </strong>

    <small>
      {questionStatus}
    </small>
  </div>

  <button
    class="control-button"
    type="button"
    onclick={onPause}
  >
    {paused ? 'Resume' : 'Pause'}
  </button>

  <button
    class="control-button danger"
    type="button"
    onclick={onFinish}
  >
    Finish test
  </button>
</section>

<style>
  .controls {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 1fr)
      auto
      auto;

    gap: 10px;
  }

  .stat-box {
    min-height: 88px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 12px;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .stat-box span {
    margin-bottom: 2px;

    color: var(--text-muted);
    font-size: 12px;
  }

  .stat-box strong {
    font-size: 20px;
    line-height: 1.2;
  }

  .stat-box small {
    margin-top: 2px;
    color: var(--success);
  }

  .success {
    color: var(--success);
  }

  .control-button {
    min-width: 88px;
    min-height: 40px;
    padding: 0 16px;

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .control-button:hover {
    background: var(--surface-hover);
  }

  .control-button.danger {
    color: var(--danger);
  }

  @media (max-width: 760px) {
    .controls {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .stat-box:nth-child(3) {
      grid-column: span 2;
    }
  }

  @media (max-width: 480px) {
    .controls {
      grid-template-columns: 1fr;
    }

    .stat-box:nth-child(3) {
      grid-column: auto;
    }

    .control-button {
      width: 100%;
    }
  }
</style>
<script>
  import {
    getPrimaryActionLabel
  } from '$lib/exam/examFlow.js';

  let {
    hasAnswer = false,
    submitted = false,
    canGoPrevious = false,
    isLastQuestion = false,

    onPrevious,
    onClear,
    onPrimary
  } = $props();

  let primaryLabel = $derived(
    getPrimaryActionLabel({
      hasAnswer,
      submitted,
      isLastQuestion
    })
  );
</script>

<nav
  class="exam-controls"
  aria-label="Exam controls"
>
  <div class="secondary-controls">
    <button
      class="previous-button"
      type="button"
      onclick={onPrevious}
      disabled={!canGoPrevious}
    >
      ← Previous
    </button>

    {#if hasAnswer && !submitted}
      <button
        class="clear-button"
        type="button"
        onclick={onClear}
      >
        Clear answer
      </button>
    {/if}
  </div>

  <button
    class="primary-button"
    type="button"
    onclick={onPrimary}
  >
    {primaryLabel}

    <span aria-hidden="true">
      →
    </span>
  </button>
</nav>

<style>
  .exam-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);

    margin-top: var(--space-4);
  }

  .secondary-controls {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  button {
    min-height: 42px;
    padding: 0 18px;

    border-radius: var(--radius);

    font-weight: 600;
  }

  .previous-button,
  .clear-button {
    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
  }

  .previous-button:hover:not(:disabled),
  .clear-button:hover {
    background: var(--surface-hover);
  }

  .previous-button:disabled {
    opacity: 0.35;
  }

  .clear-button {
    color: var(--text-muted);
  }

  .primary-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;

    min-width: 150px;

    justify-content: center;

    background: var(--primary);
    color: var(--primary-text);

    border: 1px solid var(--primary);

    font-weight: 700;
  }

  .primary-button:hover {
    background: var(--primary-hover);
  }

  @media (max-width: 600px) {
    .exam-controls {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .secondary-controls {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .primary-button {
      width: 100%;
    }

    .previous-button,
    .clear-button {
      width: 100%;
    }
  }
</style>

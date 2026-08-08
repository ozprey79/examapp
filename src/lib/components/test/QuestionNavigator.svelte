<script>
  let {
    questions = [],
    currentId = null,
    onSelect = undefined
  } = $props();
</script>

<section class="question-navigator">
  {#each questions as question}
    <button
      type="button"
      class="question-dot"
      class:current={question.id === currentId}
      class:answered={question.answered}
      class:skipped={question.skipped}
      class:review={question.review}
      aria-label={`Go to question ${question.number}`}
      title={`Question ${question.number}`}
      onclick={() => onSelect?.(question.id)}
    >
    </button>
  {/each}
</section>

<style>
  .question-navigator {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    margin-top: 18px;
  }

  .question-dot {
    width: 15px;
    height: 15px;
    padding: 0;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: 50%;
  }

  .question-dot:hover {
    background: var(--surface-hover);
  }

  .question-dot.answered {
    background: var(--success);
    border-color: var(--success);
  }

  .question-dot.skipped {
    background: var(--warning);
    border-color: var(--warning);
  }

  .question-dot.review {
    box-shadow: 0 0 0 2px var(--warning);
  }

  .question-dot.current {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
</style>
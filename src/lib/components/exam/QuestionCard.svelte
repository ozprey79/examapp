<script>

   import SavedQuestionButton
  from '$lib/components/test/SavedQuestionButton.svelte';
  let {
    question,
    selectedAnswer = null,
    submitted = false,

    mode = 'test',
    correctAnswer = null,

    onSelectAnswer = undefined
  } = $props();


  let isReview =
    $derived(
      mode === 'review'
    );


  let isPractice =
    $derived(
      mode === 'practice'
    );


  let showCorrectAnswer =
    $derived(
      isReview ||
      (
        isPractice &&
        submitted
      )
    );


  let locked =
    $derived(
      isReview ||
      submitted
    );


  function selectOption(index) {
    if (locked) {
      return;
    }

    onSelectAnswer?.(index);
  }
</script>

<section
  class="question-card"
  aria-labelledby="question-title"
>
  <div class="question-meta">
    {#if question.m}
      <span>{question.m}</span>
    {/if}

    {#if question.s}
      <span>{question.s}</span>
    {/if}

    <SavedQuestionButton
  questionId={question.id}
/>

    {#if isReview}
      <span class="state-label">
        Review
      </span>
    {:else if isPractice && submitted}
      <span class="state-label submitted">
        Checked
      </span>
    {:else if submitted}
      <span class="state-label submitted">
        Answer locked
      </span>
    {/if}
  </div>

  <div class="question-content">
    <h2 id="question-title">
      {question.t}
    </h2>

    <div class="options">
      {#each question.o as option, index}
        <button
          type="button"
          class="option"
          class:selected={
            selectedAnswer === index
          }
class:correct={
  showCorrectAnswer &&
  index === correctAnswer
}

class:wrong={
  showCorrectAnswer &&
  selectedAnswer === index &&
  index !== correctAnswer
}

disabled={locked}
          aria-pressed={
            selectedAnswer === index
          }
          onclick={() =>
            selectOption(index)}
        >
          <span class="option-letter">
            {String.fromCharCode(
              65 + index
            )}
          </span>

          <span class="option-text">
            {option}
          </span>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .question-card {
    overflow: hidden;

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-reading);
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);

    padding: var(--space-2) var(--space-4);

    color: var(--text-muted);

    border-bottom: 1px solid var(--border-soft);

    font-size: 12px;
  }

  .question-meta span:first-child {
    color: var(--primary);
    font-weight: 700;
  }

  .state-label {
    margin-left: auto;
    color: var(--text-muted);
  }

  .state-label.submitted {
    color: var(--success);
  }

  .question-content {
    padding: var(--space-6);
  }

  h2 {
    max-width: 800px;

    margin: 0 0 var(--space-6);

    color: var(--text);

    font-size: 18px;
    line-height: 1.55;
    font-weight: 000;

  }

  .options {
    display: grid;
    gap: 10px;
  }

  .option {
    width: 100%;

    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    align-items: center;

    min-height: 54px;

    padding: 7px var(--space-3) 7px var(--space-2);

    background: var(--option-bg);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    text-align: left;

    font-family: var(--font-reading);
  }

  .option:hover:not(:disabled) {
    background: var(--option-hover);
  }

  .option-letter {
    width: 30px;
    height: 30px;

    display: grid;
    place-items: center;

    /* background: var(--surface-strong); */
    background-color: transparent;
    color: var(--text);

    border: 0px solid var(--border);
    border-radius: var(--radius);

    /* font-weight: 700; */
  }

  .option.selected {
    background: var(--option-selected-bg);
    border-color: var(--option-selected-border);
  }

  .option.selected .option-letter {
    background: var(--primary);
    color: var(--primary-text);
    border-color: var(--primary);
  }

  .option.correct {
    background:
      color-mix(
        in srgb,
        var(--success) 10%,
        var(--option-bg)
      );

    border-color: var(--success);
  }

  .option.correct .option-letter {
    background: var(--success);
    color: var(--primary-text);
    border-color: var(--success);
  }

  .option.wrong {
    background:
      color-mix(
        in srgb,
        var(--danger) 10%,
        var(--option-bg)
      );

    border-color: var(--danger);
  }

  .option.wrong .option-letter {
    background: var(--danger);
    color: var(--primary-text);
    border-color: var(--danger);
  }

  .option:disabled {
    cursor: default;
  }
  #question-title{
    font-family: var(--font-reading);
    font-weight: normal;
  }
  @media (max-width: 600px) {
    .question-content {
      padding: var(--space-4);
    }

    h2 {
      font-size: 17px;
    }
  }
</style>

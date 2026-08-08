<script>
  let {
    question,
    selectedAnswer = null,
    correctAnswer = null,
    correct = null,
    explanation = null
  } = $props();


  function optionText(index) {
    if (
      index === null ||
      index === undefined
    ) {
      return 'Not answered';
    }

    return (
      question?.o?.[index] ??
      'Unknown answer'
    );
  }


  function optionLetter(index) {
    if (
      index === null ||
      index === undefined
    ) {
      return '';
    }

    return String.fromCharCode(
      65 + index
    );
  }
</script>


<section
  class="question-feedback"
  aria-live="polite"
>

  <header class="feedback-header">

    {#if correct === true}

      <span
        class="feedback-result correct"
      >
        Correct
      </span>

    {:else if correct === false}

      <span
        class="feedback-result wrong"
      >
        Incorrect
      </span>

    {/if}

  </header>


  <div class="answer-grid">

    <div class="answer-block">

      <span class="label">
        Your answer
      </span>

      <strong>
        {#if
          selectedAnswer !== null
        }
          {optionLetter(
            selectedAnswer
          )}.
        {/if}

        {optionText(
          selectedAnswer
        )}
      </strong>

    </div>


    <div class="answer-block">

      <span class="label">
        Correct answer
      </span>

      <strong>
        {#if
          correctAnswer !== null
        }
          {optionLetter(
            correctAnswer
          )}.
        {/if}

        {optionText(
          correctAnswer
        )}
      </strong>

    </div>

  </div>


  {#if explanation}

    <div class="explanation">

      <span class="label">
        Explanation
      </span>

      <p>
        {explanation}
      </p>

    </div>

  {/if}

</section>


<style>
  .question-feedback {
    display: grid;

    gap:
      var(--space-5);

    padding:
      var(--space-5)
      0;

    border-top:
      1px solid
      var(--border-soft);
  }


  .feedback-header {
    min-height: 24px;
  }


  .feedback-result {
    font-weight: 700;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .feedback-result.correct {
    color:
      var(--feedback-correct);
  }


  .feedback-result.wrong {
    color:
      var(--feedback-wrong);
  }


  .answer-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap:
      var(--space-6);
  }


  .answer-block,
  .explanation {
    display: grid;

    gap:
      var(--space-2);
  }


  .label {
    color:
      var(--text-muted);

    font-size: 0.75rem;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .answer-block strong {
    font-size: 0.9rem;

    line-height: 1.5;
  }


  .explanation p {
    margin: 0;

    color:
      var(--text);

    line-height: 1.65;
  }


  @media (
    max-width: 640px
  ) {
    .answer-grid {
      grid-template-columns:
        1fr;
    }
  }
</style>
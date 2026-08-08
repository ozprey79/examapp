<script>
  let {
    results,
    questionResults = [],
    formatDuration,
    getQuestionTime,
    saveStatus = 'idle',
    saveMessage = '',
    onRestart
  } = $props();
</script>


<section aria-labelledby="result-heading">
  <h2 id="result-heading">
    Test completed
  </h2>
{#if saveStatus !== 'idle'}
  <p aria-live="polite">
    {saveMessage}
  </p>
{/if}
  <section aria-labelledby="result-summary-heading">
    <h3 id="result-summary-heading">
      Result summary
    </h3>

    <p>
      Correct:
      <strong>{results.correct}</strong>
    </p>

    <p>
      Wrong:
      <strong>{results.wrong}</strong>
    </p>

    <p>
      Skipped:
      <strong>{results.skipped}</strong>
    </p>

    <p>
      Score:

      <strong>
        {results.score.toFixed(2)}
        /
        {results.totalQuestions}
      </strong>
    </p>

    <p>
      Time used:

      <strong>
        {formatDuration(
          results.totalTimeMilliseconds
        )}
      </strong>
    </p>
  </section>


  <section aria-labelledby="question-results-heading">
    <h3 id="question-results-heading">
      Question results
    </h3>

    <ol>
      {#each questionResults as result
        (result.id)}
        <li>
          <article>
            <h4>
              Question {result.number}
              — {result.status}
            </h4>

            <p>
              {result.questionText}
            </p>

            <p>
              Selected:

              <strong>
                {result.selectedAnswer === null
                  ? 'Skipped'
                  : String.fromCharCode(
                      65 +
                      result.selectedAnswer
                    )}
              </strong>
            </p>

            <p>
              Correct answer:

              <strong>
                {String.fromCharCode(
                  65 +
                  result.correctAnswer
                )}
              </strong>
            </p>

            <p>
              Time:

              <strong>
                {getQuestionTime(
                  result.id
                )}
              </strong>
            </p>

            <p>
              Explanation:
              {result.explanation}
            </p>
          </article>
        </li>
      {/each}
    </ol>
  </section>


  <button
    type="button"
    onclick={onRestart}
  >
    Restart
  </button>
</section>
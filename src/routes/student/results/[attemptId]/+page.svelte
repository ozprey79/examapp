<script>
  let { data } = $props();

  const attempt =
    $derived(
      data.attempt
    );


  const accuracy =
    $derived(
      attempt.totalQuestions > 0
        ? Math.round(
            (
              attempt.correct /
              attempt.totalQuestions
            ) * 100
          )
        : 0
    );


  function optionLetter(
    index
  ) {
    if (
      index === null ||
      index === undefined
    ) {
      return '—';
    }

    return String.fromCharCode(
      65 + index
    );
  }

const averageQuestionTime =
  $derived(
    attempt.answers.length > 0
      ? attempt.durationMilliseconds /
        attempt.answers.length
      : 0
  );


const fastestAnswer =
  $derived(
    attempt.answers.length > 0
      ? attempt.answers.reduce(
          (fastest, answer) =>
            answer.timeMilliseconds <
            fastest.timeMilliseconds
              ? answer
              : fastest
        )
      : null
  );


const slowestAnswer =
  $derived(
    attempt.answers.length > 0
      ? attempt.answers.reduce(
          (slowest, answer) =>
            answer.timeMilliseconds >
            slowest.timeMilliseconds
              ? answer
              : slowest
        )
      : null
  );

  const questionsWithDifficulty =
  $derived(
    attempt.answers.filter(
      (answer) =>
        Number.isFinite(
          answer.difficulty
        )
    )
  );


const paperDifficulty =
  $derived(
    questionsWithDifficulty.length > 0
      ? questionsWithDifficulty.reduce(
          (sum, answer) =>
            sum +
            answer.difficulty,
          0
        ) /
        questionsWithDifficulty.length
      : null
  );


const correctDifficulty =
  $derived.by(() => {
    const correct =
      questionsWithDifficulty.filter(
        (answer) =>
          answer.status ===
          'correct'
      );

    if (correct.length === 0) {
      return null;
    }

    return (
      correct.reduce(
        (sum, answer) =>
          sum +
          answer.difficulty,
        0
      ) /
      correct.length
    );
  });


const missedDifficulty =
  $derived.by(() => {
    const missed =
      questionsWithDifficulty.filter(
        (answer) =>
          answer.status !==
          'correct'
      );

    if (missed.length === 0) {
      return null;
    }

    return (
      missed.reduce(
        (sum, answer) =>
          sum +
          answer.difficulty,
        0
      ) /
      missed.length
    );
  });

const moduleBreakdown =
  $derived.by(() => {
    const modules =
      new Map();


    for (
      const answer
      of attempt.answers
    ) {
      const moduleName =
        answer.module ??
        'Unclassified';


      if (
        !modules.has(
          moduleName
        )
      ) {
        modules.set(
          moduleName,
          {
            module:
              moduleName,

            total: 0,
            correct: 0,
            wrong: 0,
            skipped: 0,

            timeMilliseconds: 0,

            difficultyTotal: 0,
            difficultyCount: 0
          }
        );
      }


      const item =
        modules.get(
          moduleName
        );


      item.total += 1;

      item.timeMilliseconds +=
        answer.timeMilliseconds;


      if (
        answer.status ===
        'correct'
      ) {
        item.correct += 1;
      }

      else if (
        answer.status ===
        'wrong'
      ) {
        item.wrong += 1;
      }

      else {
        item.skipped += 1;
      }


      if (
        Number.isFinite(
          answer.difficulty
        )
      ) {
        item.difficultyTotal +=
          answer.difficulty;

        item.difficultyCount +=
          1;
      }
    }


    return Array.from(
      modules.values()
    ).map(
      (item) => ({
        ...item,

        accuracy:
          item.total > 0
            ? (
                item.correct /
                item.total
              ) * 100
            : 0,

        averageDifficulty:
          item.difficultyCount > 0
            ? item.difficultyTotal /
              item.difficultyCount
            : null
      })
    );
  });

  function formatTime(
    milliseconds
  ) {
    const totalSeconds =
      Math.floor(
        milliseconds / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${String(minutes)
      .padStart(2, '0')}:${String(seconds)
      .padStart(2, '0')}`;
  }
</script>

<div class="result-page">

  <header class="result-header">
    <p class="eyebrow">
      Test completed
    </p>

    <h1>
      {attempt.testTitle}
    </h1>
  </header>


  <section class="result-section result-summary">
    <div class="section-heading">
      <h2>
        Result
      </h2>
    </div>

    <div class="metric-grid result-metrics">
      <article class="metric metric-primary">
        <span>Score</span>

        <strong>
          {attempt.score}
        </strong>
      </article>

      <article class="metric metric-success">
        <span>Correct</span>

        <strong>
          {attempt.correct}
        </strong>
      </article>

      <article class="metric metric-danger">
        <span>Wrong</span>

        <strong>
          {attempt.wrong}
        </strong>
      </article>

      <article class="metric metric-warning">
        <span>Skipped</span>

        <strong>
          {attempt.skipped}
        </strong>
      </article>

      <article class="metric">
        <span>Accuracy</span>

        <strong>
          {accuracy}%
        </strong>
      </article>

      <article class="metric">
        <span>Time</span>

        <strong>
          {formatTime(
            attempt.durationMilliseconds
          )}
        </strong>
      </article>
    </div>
  </section>


  <section class="result-section">
    <div class="section-heading">
      <h2>
        Time Analysis
      </h2>
    </div>

    <div class="metric-grid analysis-grid">
      <article class="metric">
        <span>
          Total used
        </span>

        <strong>
          {formatTime(
            attempt.durationMilliseconds
          )}
        </strong>
      </article>

      <article class="metric">
        <span>
          Average / question
        </span>

        <strong>
          {formatTime(
            averageQuestionTime
          )}
        </strong>
      </article>

      <article class="metric">
        <span>
          Fastest recorded
        </span>

        <strong>
          {fastestAnswer
            ? `Q${fastestAnswer.questionNumber} · ${formatTime(
                fastestAnswer.timeMilliseconds
              )}`
            : '—'}
        </strong>
      </article>

      <article class="metric">
        <span>
          Slowest recorded
        </span>

        <strong>
          {slowestAnswer
            ? `Q${slowestAnswer.questionNumber} · ${formatTime(
                slowestAnswer.timeMilliseconds
              )}`
            : '—'}
        </strong>
      </article>
    </div>
  </section>


  <section class="result-section">
    <div class="section-heading">
      <h2>
        Difficulty Analysis
      </h2>
    </div>

    <div class="metric-grid difficulty-grid">
      <article class="metric">
        <span>
          Paper average
        </span>

        <strong>
          {paperDifficulty === null
            ? '—'
            : paperDifficulty.toFixed(2)}
        </strong>
      </article>

      <article class="metric metric-success">
        <span>
          Correct-answer average
        </span>

        <strong>
          {correctDifficulty === null
            ? '—'
            : correctDifficulty.toFixed(2)}
        </strong>
      </article>

      <article class="metric metric-danger">
        <span>
          Missed-answer average
        </span>

        <strong>
          {missedDifficulty === null
            ? '—'
            : missedDifficulty.toFixed(2)}
        </strong>
      </article>
    </div>
  </section>


  <section class="result-section">
    <div class="section-heading">
      <h2>
        Module Breakdown
      </h2>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Qs</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Skip</th>
            <th>Accuracy</th>
            <th>Avg Difficulty</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {#each
            moduleBreakdown
            as module
          }
            <tr>
              <td>
                {module.module}
              </td>

              <td>
                {module.total}
              </td>

              <td class="value-success">
                {module.correct}
              </td>

              <td class="value-danger">
                {module.wrong}
              </td>

              <td class="value-warning">
                {module.skipped}
              </td>

              <td>
                {module.accuracy
                  .toFixed(0)}%
              </td>

              <td>
                {module.averageDifficulty === null
                  ? '—'
                  : module.averageDifficulty
                      .toFixed(2)}
              </td>

              <td>
                {formatTime(
                  module.timeMilliseconds
                )}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>


  <section class="review-action">
    <a
      class="primary-action"
      href={`/student/results/${attempt.id}/review`}
    >
      Review All Questions
      <span aria-hidden="true">
        →
      </span>
    </a>
  </section>


  <section class="result-section">
    <div class="section-heading">
      <h2>
        Question Breakdown
      </h2>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Q</th>
            <th>Question</th>
            <th>Result</th>
            <th>Yours</th>
            <th>Correct</th>
            <th>Time</th>
            <th>Difficulty</th>
          </tr>
        </thead>

        <tbody>
          {#each
            attempt.answers
            as answer
          }
            <tr>
              <td>
                {answer.questionNumber}
              </td>

              <td class="question-cell">
                {answer.questionText}
              </td>

              <td
                class:status-correct={
                  answer.status ===
                  'correct'
                }
                class:status-wrong={
                  answer.status ===
                  'wrong'
                }
                class:status-skipped={
                  answer.status !==
                  'correct' &&
                  answer.status !==
                  'wrong'
                }
              >
                {answer.status}
              </td>

              <td>
                {optionLetter(
                  answer.selectedAnswer
                )}
              </td>

              <td>
                {optionLetter(
                  answer.correctAnswer
                )}
              </td>

              <td>
                {formatTime(
                  answer.timeMilliseconds
                )}
              </td>

              <td>
                {answer.difficulty ?? '—'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

</div>


<style>
  .result-page {
    width: min(
      calc(
        100% -
        var(--space-8)
      ),
      var(--page-width)
    );

    margin-inline: auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    display: grid;

    gap:
      var(--space-6);
  }


  .result-header {
    display: grid;

    gap:
      var(--space-1);
  }


  .eyebrow {
    margin: 0;

    color:
      var(--text-muted);

    font-size:
      var(--font-size-base);

    font-weight:
      inherit;

    text-transform:
      uppercase;
  }


  h1,
  h2,
  p {
    margin: 0;
  }


  h1 {
    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) * 1.7
      );

    line-height:
      1.25;
  }


  h2 {
    color:
      var(--text);

    font-size:
      calc(
        var(--font-size-base) * 1.15
      );

    line-height:
      1.3;
  }


  .result-section {
    display: grid;

    gap:
      var(--space-3);
  }


  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap:
      var(--space-4);
  }


  .metric-grid {
    display: grid;

    gap:
      var(--space-2);
  }


  .result-metrics {
    grid-template-columns:
      repeat(
        6,
        minmax(0, 1fr)
      );
  }


  .analysis-grid {
    grid-template-columns:
      repeat(
        4,
        minmax(0, 1fr)
      );
  }


  .difficulty-grid {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }


  .metric {
    min-width: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;

    gap:
      var(--space-2);

    padding:
      var(--space-4);

    background:
      var(--surface);

    border-radius:
      var(--radius);
  }


  .metric span {
    color:
      var(--text-muted);

    font-size:
      var(--font-size-base);
  }


  .metric strong {
    color:
      var(--text);

    font-size:
      calc(
        var(--font-size-base) * 1.45
      );

    line-height:
      1;

    font-variant-numeric:
      tabular-nums;
  }


  .metric-primary strong {
    color:
      var(--primary);
  }


  .metric-success strong,
  .value-success,
  .status-correct {
    color:
      var(--success);
  }


  .metric-danger strong,
  .value-danger,
  .status-wrong {
    color:
      var(--danger);
  }


  .metric-warning strong,
  .value-warning,
  .status-skipped {
    color:
      var(--warning);
  }


  .table-scroll {
    overflow-x: auto;

    border-radius:
      var(--radius);
  }


  table {
    width: 100%;

    border-collapse:
      separate;

    border-spacing:
      0
      var(--space-1);

    color:
      var(--text);

    font-size:
      var(--font-size-base);
  }


  th {
    padding:
      var(--space-2)
      var(--space-3);

    color:
      var(--text-muted);

    font-weight:
      inherit;

    text-align:
      left;

    white-space:
      nowrap;
  }


  td {
    padding:
      var(--space-3);

    background:
      var(--surface);

    vertical-align:
      top;

    font-variant-numeric:
      tabular-nums;
  }


  tbody tr:hover td {
    background:
      var(--surface-hover);
  }


  .question-cell {
    min-width:
      calc(
        var(--space-16) * 4
      );

    line-height:
      1.5;
  }


  .status-correct,
  .status-wrong,
  .status-skipped {
    font-weight:
      inherit;

    text-transform:
      capitalize;
  }


  .review-action {
    display: flex;
    justify-content: flex-end;
  }


  .primary-action {
    min-height:
      calc(
        var(--space-8) +
        var(--space-2)
      );

    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap:
      var(--space-2);

    padding:
      0
      var(--space-4);

    background:
      var(--primary);

    color:
      var(--primary-text);

    border-radius:
      var(--radius);

    font-weight:
      inherit;

    text-decoration:
      none;
  }


  .primary-action:hover {
    background:
      var(--primary-hover);
  }


  @media (max-width: 900px) {
    .result-metrics {
      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        );
    }


    .analysis-grid {
      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );
    }
  }


  @media (max-width: 600px) {
    .result-page {
      width:
        calc(
          100% -
          var(--space-6)
        );

      padding-top:
        var(--space-4);
    }


    .result-metrics,
    .analysis-grid,
    .difficulty-grid {
      grid-template-columns:
        1fr;
    }


    .review-action {
      display: block;
    }


    .primary-action {
      width: 100%;
    }
  }
</style>

<script>
  import TopicForceMap
    from '$lib/components/results/TopicForceMap.svelte';

  import HalftoneAction
    from '$lib/components/test/ui/HalftoneAction.svelte';


  let { data } = $props();

  const MODULE_NAMES = {
  M1: 'Structural Engineering & Mechanics',
  M2: 'Fluid Mechanics & Hydraulics',
  M3: 'Hydrology & Water Resources',
  M4: 'Surveying & Estimation',
  M5: 'Building Materials & Construction Technology',
  M6: 'Construction Management & PERT/CPM',
  M7: 'Environmental Engineering',
  M8: 'RCC & Steel Design',
  M9: 'Geotechnical Engineering',
  M10: 'Transportation Engineering'
};


function getModuleName(
  moduleCode
) {
  return (
    MODULE_NAMES[moduleCode] ??
    moduleCode ??
    'Unclassified'
  );
}
let selectedModule =
  $state(null);


function selectModule(
  moduleCode
) {
  selectedModule =
    moduleCode;
}


function resetModuleFilter() {
  selectedModule =
    null;
}


const filteredAnswers =
  $derived.by(() => {

    if (
      selectedModule ===
      null
    ) {
      return attempt.answers;
    }


    return attempt.answers.filter(
      (answer) =>
        (
          answer.module ??
          'Unclassified'
        ) ===
        selectedModule
    );
  });
  const attempt =
    $derived(
      data.attempt
    );


  /* ============================================================
     SUMMARY
  ============================================================ */

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


  /* ============================================================
     TIME
  ============================================================ */

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
            (
              fastest,
              answer
            ) =>
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
            (
              slowest,
              answer
            ) =>
              answer.timeMilliseconds >
              slowest.timeMilliseconds
                ? answer
                : slowest
          )
        : null
    );


  /* ============================================================
     DIFFICULTY
  ============================================================ */

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
            (
              sum,
              answer
            ) =>
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


      if (
        correct.length === 0
      ) {
        return null;
      }


      return (
        correct.reduce(
          (
            sum,
            answer
          ) =>
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


      if (
        missed.length === 0
      ) {
        return null;
      }


      return (
        missed.reduce(
          (
            sum,
            answer
          ) =>
            sum +
            answer.difficulty,
          0
        ) /
        missed.length
      );
    });


  /* ============================================================
     MODULE BREAKDOWN
  ============================================================ */

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


        if (
          Number.isFinite(
            answer.timeMilliseconds
          )
        ) {
          item.timeMilliseconds +=
            answer.timeMilliseconds;
        }


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

          item.difficultyCount += 1;
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


  /* ============================================================
     TOPIC DISTRIBUTION
  ============================================================ */

  const topicDistribution =
    $derived.by(() => {

      const topics =
        new Map();


      for (
        const answer
        of attempt.answers
      ) {

        const topicName =
          answer.topic?.trim() ||
          'Unclassified';


        const moduleName =
          answer.module ??
          'Unclassified';


        const id =
          `${moduleName}::${topicName}`;


        if (
          !topics.has(id)
        ) {

          topics.set(
            id,
            {
              id,

              topic:
                topicName,

              module:
                moduleName,

              total: 0,

              correct: 0,

              wrong: 0,

              skipped: 0
            }
          );
        }


        const topic =
          topics.get(id);


        topic.total += 1;


        if (
          answer.status ===
          'correct'
        ) {
          topic.correct += 1;
        }

        else if (
          answer.status ===
          'wrong'
        ) {
          topic.wrong += 1;
        }

        else {
          topic.skipped += 1;
        }
      }


      return Array.from(
        topics.values()
      )

        .map(
          (topic) => ({
            ...topic,

            accuracy:
              topic.total > 0
                ? (
                    topic.correct /
                    topic.total
                  ) * 100
                : 0
          })
        )

        .sort(
          (
            a,
            b
          ) =>
            b.total -
            a.total
        );
    });


  /* ============================================================
     FORMATTERS
  ============================================================ */

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


  function formatTime(
    milliseconds
  ) {

    if (
      !Number.isFinite(
        milliseconds
      )
    ) {
      return '—';
    }


    const totalSeconds =
      Math.floor(
        milliseconds /
        1000
      );


    const minutes =
      Math.floor(
        totalSeconds /
        60
      );


    const seconds =
      totalSeconds %
      60;


    return `${String(
      minutes
    ).padStart(
      2,
      '0'
    )}:${String(
      seconds
    ).padStart(
      2,
      '0'
    )}`;
  }
</script>


<svelte:head>
  <title>
    Result · {attempt.testTitle}
  </title>
</svelte:head>


<div class="result-page">

  <!-- ========================================================
       HEADER
  ========================================================= -->

  <header class="result-header">

    <div class="heading-group">

      <p class="eyebrow">
        Test completed
      </p>


      <h1>
        {attempt.testTitle}
      </h1>


      <p class="subtitle">
        Attempt performance and
        question-level analysis.
      </p>

    </div>


    <a
      class="dashboard-action"
      href="/student"
    >
      ← Dashboard
    </a>

  </header>



  <!-- ========================================================
       SCORE HERO
  ========================================================= -->

  <section
  class="score-line"
  aria-label="Result summary"
>

  <div class="score-item score-primary">
    <strong>
      {attempt.score}
    </strong>

    <span>
      Score
    </span>
  </div>


  <div class="score-item">
    <span>
      Correct
    </span>

    <strong class="value-success">
      {attempt.correct}
    </strong>
  </div>


  <div class="score-item">
    <span>
      Wrong
    </span>

    <strong class="value-danger">
      {attempt.wrong}
    </strong>
  </div>


  <div class="score-item">
    <span>
      Skipped
    </span>

    <strong class="value-warning">
      {attempt.skipped}
    </strong>
  </div>


  <div class="score-item">
    <span>
      Accuracy
    </span>

    <strong>
      {accuracy}%
    </strong>
  </div>


  <div class="score-item">
    <span>
      Questions
    </span>

    <strong>
      {attempt.totalQuestions}
    </strong>
  </div>

</section>



  <!-- ========================================================
       REVIEW CTA
  ========================================================= -->

  <section class="review-strip">

    <div>

      <p class="section-kicker">
        Detailed review
      </p>


      

  
    </div>


    <HalftoneAction
      href={`/student/results/${attempt.id}/review`}
      label="Review All Questions"
    />

  </section>



  <!-- ========================================================
       TIME
  ========================================================= -->

  <section class="result-section">

    <div class="section-heading">

      <div>

        <p class="section-kicker">
          Performance
        </p>


        <h2>
          Time Analysis
        </h2>

      </div>

    </div>



    <div
      class="data-strip
             four"
    >

      <div>

        <span>
          Total used
        </span>

        <strong>
          {formatTime(
            attempt.durationMilliseconds
          )}
        </strong>

      </div>


      <div>

        <span>
          Average / question
        </span>

        <strong>
          {formatTime(
            averageQuestionTime
          )}
        </strong>

      </div>


      <div>

        <span>
          Fastest
        </span>

        <strong>
          {fastestAnswer
            ? `Q${fastestAnswer.questionNumber} · ${formatTime(
                fastestAnswer.timeMilliseconds
              )}`
            : '—'}
        </strong>

      </div>


      <div>

        <span>
          Slowest
        </span>

        <strong>
          {slowestAnswer
            ? `Q${slowestAnswer.questionNumber} · ${formatTime(
                slowestAnswer.timeMilliseconds
              )}`
            : '—'}
        </strong>

      </div>

    </div>

  </section>



  <!-- ========================================================
       DIFFICULTY
  ========================================================= -->

  <section class="result-section">

    <div class="section-heading">

      <div>

        <p class="section-kicker">
          Question profile
        </p>


        <h2>
          Difficulty Analysis
        </h2>

      </div>

    </div>



    <div
      class="data-strip
             three"
    >

      <div>

        <span>
          Paper average
        </span>

        <strong>
          {paperDifficulty === null
            ? '—'
            : paperDifficulty.toFixed(
                2
              )}
        </strong>

      </div>


      <div>

        <span>
          Correct average
        </span>

        <strong
          class="value-success"
        >
          {correctDifficulty === null
            ? '—'
            : correctDifficulty.toFixed(
                2
              )}
        </strong>

      </div>


      <div>

        <span>
          Missed average
        </span>

        <strong
          class="value-danger"
        >
          {missedDifficulty === null
            ? '—'
            : missedDifficulty.toFixed(
                2
              )}
        </strong>

      </div>

    </div>

  </section>



  <!-- ========================================================
       TOPIC FORCE MAP
  ========================================================= -->

  <section class="result-section">

    <div class="section-heading">

      <div>

        <p class="section-kicker">
          Data visualization
        </p>


        <h2>
          Topic Distribution
        </h2>

      </div>


      <span class="section-note">
        Size = frequency
        ·
        intensity = accuracy
      </span>

    </div>


    <TopicForceMap
  topics={
    topicDistribution
  }

  onModuleSelect={
    selectModule
  }
/>

  </section>



  <!-- ========================================================
       MODULE BREAKDOWN
  ========================================================= -->

  <section class="result-section">

    <div class="section-heading">

      <div>

        <p class="section-kicker">
          Subject performance
        </p>


        <h2>
          Module Breakdown
        </h2>

      </div>


      <span class="section-note">
        {moduleBreakdown.length}
        modules
      </span>

    </div>



    <div class="table-scroll">

      <table>

        <thead>

          <tr>

            <th>
              Module
            </th>

            <th>
              Qs
            </th>

            <th>
              Correct
            </th>

            <th>
              Wrong
            </th>

            <th>
              Skip
            </th>

            <th>
              Accuracy
            </th>

            <th>
              Avg Difficulty
            </th>

            <th>
              Time
            </th>

          </tr>

        </thead>


        <tbody>

          {#each
            moduleBreakdown
            as module
          }

            <tr>

              <td
                class="module-name"
              >
                {module.module}
              </td>


              <td>
                {module.total}
              </td>


              <td
                class="value-success"
              >
                {module.correct}
              </td>


              <td
                class="value-danger"
              >
                {module.wrong}
              </td>


              <td
                class="value-warning"
              >
                {module.skipped}
              </td>


              <td>

                <div
                  class="accuracy-cell"
                >

                  <strong>
                    {module.accuracy
                      .toFixed(
                        0
                      )}%
                  </strong>


                  <div
                    class="accuracy-track"
                    aria-hidden="true"
                  >

                    <div
                      class="accuracy-fill"
                      style={`width: ${module.accuracy}%`}
                    ></div>

                  </div>

                </div>

              </td>


              <td>
                {module.averageDifficulty ===
                null
                  ? '—'
                  : module.averageDifficulty
                      .toFixed(
                        2
                      )}
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
{#if selectedModule !== null}

  <div class="active-module-filter">

    <span>
      Showing questions from
    </span>

    <strong>
      {getModuleName(
        selectedModule
      )}
    </strong>

    <button
      type="button"
      onclick={
        resetModuleFilter
      }
    >
      Show All ×
    </button>

  </div>

{/if}


  <!-- ========================================================
       QUESTION BREAKDOWN
  ========================================================= -->

  <section class="result-section">

    <div class="section-heading">

      <div>

        <p class="section-kicker">
          Question level
        </p>


        <h2>
          Question Breakdown
        </h2>

      </div>


      <span class="section-note">
        {attempt.answers.length}
        questions
      </span>

    </div>



    <div class="table-scroll">

      <table
        class="question-table"
      >

        <thead>

          <tr>

            <th>
              Q
            </th>

            <th>
              Question
            </th>

            <th>
              Result
            </th>

            <th>
              Yours
            </th>

            <th>
              Correct
            </th>

            <th>
              Time
            </th>

            <th>
              Difficulty
            </th>

          </tr>

        </thead>


        <tbody>

          {#each
  filteredAnswers
  as answer
}

            <tr>

              <td
                class="question-number"
              >
                {answer.questionNumber}
              </td>


              <td
                class="question-cell"
              >

                <span
                  class="question-meta"
                >
                  {getModuleName(
  answer.module
)}
                  {#if answer.topic}
                    ·
                    {answer.topic}
                  {/if}
                </span>


                <span
                  class="question-text"
                >
                  {answer.questionText}
                </span>

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
                {answer.difficulty ??
                  '—'}
              </td>

            </tr>

          {/each}

        </tbody>

      </table>

    </div>

  </section>



  <!-- ========================================================
       END
  ========================================================= -->

  <footer class="result-footer">

    <a
      class="dashboard-link"
      href="/student"
    >
      ← Return to Dashboard
    </a>

  </footer>

</div>


<style>

  /* ==========================================================
     PAGE
  ========================================================== */

  .result-page {
    width:
      min(
        calc(
          100% -
          var(--space-8)
        ),
        var(--page-width)
      );

    margin-inline:
      auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    display:
      grid;

    gap:
      var(--space-8);

    font-family:
      var(--font-reading);
  }



  /* ==========================================================
     TYPOGRAPHY
  ========================================================== */

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
        var(--font-size-base) *
        1.7
      );

    line-height:
      1.25;

    font-weight:
      600;
  }


  h2 {
    color:
      var(--text);

    font-size:
      calc(
        var(--font-size-base) *
        1.15
      );

    line-height:
      1.3;

    font-weight:
      600;
  }


  .eyebrow,
  .section-kicker {
    margin-bottom:
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );

    letter-spacing:
      0.07em;

    text-transform:
      uppercase;
  }


  .subtitle,
  .section-copy,
  .section-note {
    color:
      var(--text-muted);

    line-height:
      1.5;
  }


  .subtitle {
    margin-top:
      var(--space-1);
  }


  .section-note {
    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );
  }



  /* ==========================================================
     HEADER
  ========================================================== */

  .result-header {
    display:
      flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding-bottom:
      var(--space-5);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .heading-group {
    min-width: 0;
  }


  .dashboard-action,
  .dashboard-link {
    min-height:
      40px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0
      var(--space-4);

    background:
      var(--surface);

    color:
      var(--text);

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius-one);

    font-size:
      calc(
        var(--font-size-base) *
        0.9
      );

    font-weight:
      600;

    text-decoration:
      none;
  }


  .dashboard-action:hover,
  .dashboard-link:hover {
    background:
     var(--verdigris-gold);

    border-color:
      var(--verdigris-gold);
  }



  /* ==========================================================
     SCORE HERO
  ========================================================== */
    .score-line {
  display: flex;

  align-items: baseline;

  gap: var(--space-6);

  padding:
    var(--space-3)
    0;

  border-top:
    1px solid
    var(--border-soft);

  border-bottom:
    1px solid
    var(--border-soft);

  overflow-x: auto;
}


.score-item {
  flex: 0 0 auto;

  display: inline-flex;

  align-items: baseline;

  gap: var(--space-2);

  white-space: nowrap;
}


.score-item span {
  color:
    var(--text-muted);
}


.score-item strong {
  color:
    var(--text);

  font-family:
    var(--font-heading);

  font-size:
    calc(
      var(--font-size-base) *
      1.1
    );

  font-weight: 600;

  font-variant-numeric:
    tabular-nums;
}


.score-primary strong {
  color:
    var(--primary);

  font-size:
    calc(
      var(--font-size-base) *
      1.35
    );
}


.score-item
  .value-success {
  color:
    var(--success);
}


.score-item
  .value-danger {
  color:
    var(--danger);
}


.score-item
  .value-warning {
  color:
    var(--warning);
}


  .score-display strong {
    color:
      var(--primary);

    font-family:
      var(--font-heading);

    font-size:
      clamp(
        48px,
        8vw,
        82px
      );

    line-height:
      0.95;

    font-weight:
      500;

    font-variant-numeric:
      tabular-nums;
  }


  .score-display span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }



  /* ==========================================================
     DATA STRIPS
  ========================================================== */

  .summary-strip,
  .data-strip {
    display:
      grid;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .summary-strip {
    grid-template-columns:
      repeat(
        5,
        minmax(
          0,
          1fr
        )
      );
  }


  .data-strip.four {
    grid-template-columns:
      repeat(
        4,
        minmax(
          0,
          1fr
        )
      );
  }


  .data-strip.three {
    grid-template-columns:
      repeat(
        3,
        minmax(
          0,
          1fr
        )
      );
  }


  .summary-strip > div,
  .data-strip > div {
    min-width: 0;

    display:
      grid;

    gap:
      var(--space-2);

    padding:
      var(--space-4);

    border-right:
      1px solid
      var(--border-soft);
  }


  .summary-strip
    > div:last-child,
  .data-strip
    > div:last-child {
    border-right: 0;
  }


  .summary-strip span,
  .data-strip span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );

    text-transform:
      uppercase;
  }


  .summary-strip strong,
  .data-strip strong {
    color:
      var(--text);

    font-size:
      calc(
        var(--font-size-base) *
        1.35
      );

    line-height:
      1;

    font-weight:
      600;

    font-variant-numeric:
      tabular-nums;
  }



  /* ==========================================================
     REVIEW CTA
  ========================================================== */

  .review-strip {
    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding:
      var(--space-5)
      0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .review-strip > div {
    display:
      grid;

    gap:
      var(--space-1);
  }


  .section-copy {
    max-width:
      46rem;

    margin-top:
      var(--space-1);
  }



  /* ==========================================================
     SECTIONS
  ========================================================== */

  .result-section {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .section-heading {
    display:
      flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }



  /* ==========================================================
     STATUS
  ========================================================== */

  .value-success,
  .status-correct {
    color:
      var(--success);
  }


  .value-danger,
  .status-wrong {
    color:
      var(--danger);
  }


  .value-warning,
  .status-skipped {
    color:
      var(--warning);
  }



  /* ==========================================================
     TABLES
  ========================================================== */

  .table-scroll {
    overflow-x:
      auto;

    border-top:
      1px solid
      var(--border-soft);
  }


  table {
    width:
      100%;

    border-collapse:
      collapse;

    color:
      var(--text);

    font-size:
      var(--font-size-base);
  }


  th {
    padding:
      var(--space-3);

    color:
      var(--text-muted);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );

    font-weight:
      600;

    letter-spacing:
      0.05em;

    text-align:
      left;

    text-transform:
      uppercase;

    white-space:
      nowrap;
  }


  td {
    padding:
      var(--space-3);

    border-bottom:
      1px solid
      var(--border-soft);

    vertical-align:
      top;

    font-variant-numeric:
      tabular-nums;
  }


  tbody tr:hover {
    background:
      var(--surface-hover);
  }


  .module-name {
    color:
      var(--primary);

    font-weight:
      600;
  }



  /* ==========================================================
     MODULE ACCURACY BAR
  ========================================================== */

  .accuracy-cell {
    min-width:
      96px;

    display:
      grid;

    gap:
      var(--space-2);
  }


  .accuracy-cell strong {
    font-weight:
      600;
  }


  .accuracy-track {
    width:
      100%;

    height:
      2px;

    overflow:
      hidden;

    background:
      var(--border-soft);
  }


  .accuracy-fill {
    height:
      100%;

    background:
      var(--primary);
  }



  /* ==========================================================
     QUESTION TABLE
  ========================================================== */

  .question-number {
    color:
      var(--text-muted);
  }


  .question-cell {
    min-width:
      calc(
        var(--space-16) *
        4
      );

    display:
      grid;

    gap:
      var(--space-1);

    line-height:
      1.45;
  }


  .question-meta {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );

    letter-spacing:
      0.03em;

    text-transform:
      uppercase;
  }


  .question-text {
    color:
      var(--text);
  }


  .status-correct,
  .status-wrong,
  .status-skipped {
    font-weight:
      600;

    text-transform:
      capitalize;
  }



  /* ==========================================================
     FOOTER
  ========================================================== */

  .result-footer {
    display:
      flex;

    justify-content:
      flex-start;

    padding-top:
      var(--space-4);

    border-top:
      1px solid
      var(--border-soft);
  }



  /* ==========================================================
     RESPONSIVE
  ========================================================== */

  @media (
    max-width: 850px
  ) {

    .summary-strip {
      grid-template-columns:
        repeat(
          3,
          minmax(
            0,
            1fr
          )
        );
    }


    .data-strip.four {
      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );
    }


    .summary-strip
      > div:nth-child(3),
    .data-strip.four
      > div:nth-child(2) {
      border-right: 0;
    }

  }


  @media (
    max-width: 600px
  ) {

    .result-page {
      width:
        calc(
          100% -
          var(--space-6)
        );

      padding-top:
        var(--space-4);

      gap:
        var(--space-6);
    }


    .result-header,
    .review-strip {
      align-items:
        stretch;

      flex-direction:
        column;
    }


    .dashboard-action {
      align-self:
        flex-start;
    }


    .summary-strip,
    .data-strip.four,
    .data-strip.three {
      grid-template-columns:
        1fr;
    }


    .summary-strip > div,
    .data-strip > div {
      border-right: 0;

      border-bottom:
        1px solid
        var(--border-soft);
    }


    .summary-strip
      > div:last-child,
    .data-strip
      > div:last-child {
      border-bottom: 0;
    }


    .section-heading {
      align-items:
        flex-start;

      flex-direction:
        column;
    }


    .dashboard-link {
      width: 100%;
    }

  }

</style>

<script>
  import "@fontsource/space-mono/400.css";
  import "@fontsource/space-mono/700.css";

  import SignOutButton
    from "$lib/components/auth/SignOutButton.svelte";

  import AttemptProgressEqualizer
    from "$lib/components/AttemptProgressEqualizer.svelte";

  import LeitnerForceCollider
    from "$lib/components/dashboard/2LeitnerForceCollider.svelte";

  import SavedQuestionsForceMap
    from "$lib/components/dashboard/SavedQuestionsForceMap.svelte";


  let { data } = $props();

  let activeSection =
    $state("results");


  let selectedSavedId =
    $state(null);


  const recentAttempts =
    $derived(
      data.progress?.recentAttempts ??
      data.dashboardSummary?.recentAttempts ??
      []
    );


  const progressAttempts =
    $derived(
      data.progress?.progressAttempts ??
      recentAttempts
    );


  const tests =
    $derived(
      data.tests ??
      []
    );


  const savedQuestions =
    $derived(
      data.savedQuestions ??
      []
    );


  const savedCount =
    $derived(
      savedQuestions.length
    );


  const dueCount =
    $derived(
      data.revision?.dueCount ??
      data.dueCount ??
      0
    );


  const studentName =
    $derived(
      data.profile?.displayName ??
      data.user?.name ??
      data.user?.email ??
      "Student"
    );


  function formatScore(score) {
    if (
      score === null ||
      score === undefined
    ) {
      return "—";
    }

    const rounded =
      Number(score)
        .toFixed(1)
        .replace(/\.0$/, "");

    return Number(score) > 0
      ? `+${rounded}`
      : rounded;
  }


  function getScoreClass(score) {
    const value =
      Number(score);

    if (value > 0) {
      return "score-positive";
    }

    if (value < 0) {
      return "score-negative";
    }

    return "score-neutral";
  }


  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Date(value)
      .toLocaleDateString("en-IN");
  }


  function getCorrect(attempt) {
    return (
      attempt.correct ??
      attempt.correctCount ??
      0
    );
  }


  function getWrong(attempt) {
    return (
      attempt.wrong ??
      attempt.wrongCount ??
      0
    );
  }


  function getSkipped(attempt) {
    return (
      attempt.skipped ??
      attempt.skippedCount ??
      0
    );
  }


  function getSavedQuestionId(question) {
    return (
      question.question_id ??
      question.id
    );
  }


  function getSavedQuestionText(question) {
    return (
      question.question_text ??
      question.text ??
      question.t ??
      "Question"
    );
  }


  function getSavedQuestionTopic(question) {
    return (
      question.topic ??
      question.s ??
      "—"
    );
  }


  function getSavedQuestionModule(question) {
    return (
      question.module ??
      question.m ??
      "—"
    );
  }


  function locateSavedQuestion(
    questionId
  ) {
    selectedSavedId =
      questionId;


    requestAnimationFrame(
      () => {

        document
          .getElementById(
            `saved-row-${questionId}`
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });
      }
    );
  }

</script>


<svelte:head>
  <title>Student Dashboard</title>
</svelte:head>


<div class="dashboard-page">

  <!-- ======================================================
       HEADER
  ======================================================= -->

  <header class="dashboard-header">

    <div class="heading-group">
      <p class="eyebrow">
        Student
      </p>

      <h1>
        Progress
      </h1>
    </div>


    <div class="account-area">

      <div class="account-copy">
        <strong>
          Hi, {studentName}
        </strong>

        <span>
          {data.user?.email ?? ""}
        </span>
      </div>


      <div class="signout-wrap">
        <SignOutButton />
      </div>

    </div>

  </header>


  <!-- ======================================================
       ACTIVE VISUALIZATION
  ======================================================= -->

  <section class="dashboard-viz">

    {#if activeSection === "results"}

      <AttemptProgressEqualizer
        attempts={progressAttempts}
        totalAttempts={data.progress?.attemptCount ?? progressAttempts.length}
      />


    {:else if activeSection === "leitner"}

      <LeitnerForceCollider
        questions={data.leitnerVisualization ?? []}
      />


    {:else if activeSection === "saved"}

      <SavedQuestionsForceMap
        questions={savedQuestions}
        selectedId={selectedSavedId}
        onSelect={locateSavedQuestion}
      />


    {:else if activeSection === "tests"}

      <div class="viz-placeholder">

        <p>
          Available
        </p>

        <strong>
          {tests.length}
        </strong>

        <span>
          {tests.length === 1
            ? "examination"
            : "examinations"}
        </span>

      </div>

    {/if}

  </section>


  <!-- ======================================================
       RESULTS / LEITNER / SAVED / TESTS
  ======================================================= -->

  <section class="dashboard-switcher">

    <div
      class="section-rail"
      role="tablist"
      aria-label="Student dashboard sections"
    >

      <button
        type="button"
        role="tab"
        class:active={activeSection === "results"}
        aria-selected={activeSection === "results"}
        aria-controls="results-panel"
        onclick={() => {
          activeSection = "results";
        }}
      >
        Results
      </button>


      <button
        type="button"
        role="tab"
        class:active={activeSection === "leitner"}
        aria-selected={activeSection === "leitner"}
        aria-controls="leitner-panel"
        onclick={() => {
          activeSection = "leitner";
        }}
      >
        <span>
          Leitner
        </span>

        <span class="tab-count">
          {dueCount}
        </span>
      </button>


      <button
        type="button"
        role="tab"
        class:active={activeSection === "saved"}
        aria-selected={activeSection === "saved"}
        aria-controls="saved-panel"
        onclick={() => {
          activeSection = "saved";
        }}
      >
        <span>
          Saved
        </span>

        <span class="tab-count">
          {savedCount}
        </span>
      </button>


      <button
        type="button"
        role="tab"
        class:active={activeSection === "tests"}
        aria-selected={activeSection === "tests"}
        aria-controls="tests-panel"
        onclick={() => {
          activeSection = "tests";
        }}
      >
        <span>
          Tests
        </span>

        <span class="tab-count">
          {tests.length}
        </span>
      </button>

    </div>


    <div class="section-panel">

      <!-- ==================================================
           RESULTS
      =================================================== -->

      {#if activeSection === "results"}

        <section
          id="results-panel"
          class="panel-block"
          role="tabpanel"
          aria-label="Results"
        >

          <header class="panel-heading">

            <div>
              <p class="panel-eyebrow">
                History
              </p>

              <h2>
                Recent attempts
              </h2>
            </div>

          </header>


          {#if recentAttempts.length === 0}

            <div class="empty-state">
              <strong>
                No completed attempts.
              </strong>

              <span>
                Completed tests will appear here.
              </span>
            </div>

          {:else}

            <div class="attempt-table">

              <div
                class="attempt-table-head"
                aria-hidden="true"
              >
                <span>Test</span>
                <span>Score</span>
                <span>Correct</span>
                <span>Date</span>
                <span></span>
              </div>


              {#each recentAttempts as attempt (attempt.id)}

                <article class="attempt-row">

                  <div class="attempt-test">

                    <strong>
                      {attempt.testTitle}
                    </strong>

                    <span>
                      {getWrong(attempt)} wrong ·
                      {getSkipped(attempt)} skipped
                    </span>

                  </div>


                  <strong
                    class={`attempt-score ${getScoreClass(attempt.score)}`}
                  >
                    {formatScore(attempt.score)}
                  </strong>


                  <span class="attempt-correct">
                    {getCorrect(attempt)}
                  </span>


                  <span class="attempt-date">
                    {formatDate(attempt.completedAt)}
                  </span>


                  <a
                    class="attempt-link"
                    href={`/student/results/${attempt.id}`}
                  >
                    Result →
                  </a>

                </article>

              {/each}

            </div>

          {/if}

        </section>


      <!-- ==================================================
           LEITNER
      =================================================== -->

      {:else if activeSection === "leitner"}

        <section
          id="leitner-panel"
          class="panel-block"
          role="tabpanel"
          aria-label="Leitner revision"
        >

          <header class="panel-heading">

            <div>
              <p class="panel-eyebrow">
                Revision
              </p>

              <h2>
                Leitner system
              </h2>
            </div>


            <a
              class="text-action"
              href="/student/revision"
            >
              Open revision →
            </a>

          </header>


          <div class="leitner-summary">

            <div class="metric-block">

              <strong>
                {dueCount}
              </strong>

              <div>
                <span>
                  Due now
                </span>

                <p>
                  Questions scheduled for review.
                </p>
              </div>

            </div>


            <div class="panel-actions">

              {#if dueCount > 0}

                <a
                  class="primary-action"
                  href="/student/revision/due"
                >
                  Start Due Review
                </a>

              {/if}


              <a
                class="secondary-action"
                href="/student/revision/practice"
              >
                Practice by Box
              </a>

            </div>

          </div>

        </section>


      <!-- ==================================================
           SAVED
      =================================================== -->

      {:else if activeSection === "saved"}

        <section
          id="saved-panel"
          class="panel-block"
          role="tabpanel"
          aria-label="Saved questions"
        >

          <header class="panel-heading">

            <div>
              <p class="panel-eyebrow">
                Personal collection
              </p>

              <h2>
                Saved questions
              </h2>
            </div>


            <div class="panel-actions">

              {#if savedCount > 0}

                <a
                  class="primary-action"
                  href="/student/saved/practice"
                >
                  Practice Saved
                </a>

              {/if}


              <a
                class="secondary-action"
                href="/student/saved"
              >
                View All
              </a>

            </div>

          </header>


          {#if savedQuestions.length === 0}

            <div class="saved-empty">

              <strong>
                0
              </strong>

              <span>
                bookmarked
              </span>

            </div>

          {:else}

            <div class="saved-table">

              <div
                class="saved-table-head"
                aria-hidden="true"
              >
                <span>
                  Saved question
                </span>

                <span>
                  Sub topic
                </span>

                <span>
                  Main topic
                </span>

                <span></span>
              </div>


              {#each savedQuestions as question (getSavedQuestionId(question))}

                <article
                  id={`saved-row-${getSavedQuestionId(question)}`}

                  class="saved-table-row"

                  class:selected={
                    selectedSavedId ===
                    getSavedQuestionId(question)
                  }
                >

                  <div class="saved-question">
                    {getSavedQuestionText(question)}
                  </div>


                  <div class="saved-subtopic">
                    {getSavedQuestionTopic(question)}
                  </div>


                  <div class="saved-main-topic">
                    {getSavedQuestionModule(question)}
                  </div>


                  <div class="saved-open">

                    <a
                      href={`/student/saved/${getSavedQuestionId(question)}`}
                    >
                      Open →
                    </a>

                  </div>

                </article>

              {/each}

            </div>

          {/if}

        </section>


      <!-- ==================================================
           TESTS
      =================================================== -->

      {:else}

        <section
          id="tests-panel"
          class="panel-block"
          role="tabpanel"
          aria-label="Available tests"
        >

          <header class="panel-heading">

            <div>
              <p class="panel-eyebrow">
                Examination
              </p>

              <h2>
                Available tests
              </h2>
            </div>


            <span class="section-note">
              {tests.length} available
            </span>

          </header>


          {#if tests.length === 0}

            <div class="empty-state">
              <strong>
                No tests available.
              </strong>

              <span>
                New tests will appear here when published.
              </span>
            </div>

          {:else}

            <div class="test-list">

              {#each tests as test (test.id)}

                <article class="test-row">

                  <div class="test-copy">

                    <strong>
                      {test.title}
                    </strong>

                    <span>
                      {test.questionCount} questions ·
                      {test.durationMinutes} min
                    </span>

                  </div>


                  <a href={`/student/test/${test.id}`}>
                    Start →
                  </a>

                </article>

              {/each}

            </div>

          {/if}

        </section>

      {/if}

    </div>

  </section>

</div>


<style>
  .dashboard-page {
    width:
      min(
        calc(100% - var(--space-8)),
        var(--page-width)
      );

    margin-inline:
      auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    color:
      var(--text);

    font-family:
      var(--fonty);

      	
  }


  /* ========================================================
     Header
  ======================================================== */

  .dashboard-header {
    display:
      flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding-bottom:
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);

    font-family:
      "Space Mono",
      monospace;
  }


  .heading-group {
    min-width:
      0;
  }


  .eyebrow,
  .panel-eyebrow {
    margin:
      0 0
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );

    font-weight:
      600;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  h1,
  h2,
  p {
    margin:
      0;
  }


  h1 {
    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        1.9
      );

    line-height:
      1.15;

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


  .account-area {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-3);
  }


  .account-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);

    text-align:
      right;
  }


  .account-copy strong {
    font-size:
      calc(
        var(--font-size-base) *
        0.9
      );

    font-weight:
      600;
  }


  .account-copy span {
    max-width:
      240px;

    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  .signout-wrap :global(button) {
    min-height:
      var(--space-8);

    padding:
      0 var(--space-3);

    background-color:
      transparent;

    color:
      var(--text-muted);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      var(--radius);
  }


  .signout-wrap :global(button:hover) {
    color:
      var(--text);

    background-color:
      var(--surface-hover);

    border-color:
      var(--border);
  }


  /* ========================================================
     Active visualization
  ======================================================== */

  .dashboard-viz {
    margin-top:
      var(--space-8);
  }


  .viz-placeholder {
    min-height:
      220px;

    display:
      flex;

    flex-direction:
      column;

    justify-content:
      center;

    gap:
      var(--space-2);

    padding:
      var(--space-4) 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .viz-placeholder p,
  .viz-placeholder span {
    color:
      var(--text-muted);
  }


  .viz-placeholder strong {
    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        2.7
      );

    font-weight:
      500;

    font-variant-numeric:
      tabular-nums;
  }


  /* ========================================================
     Tab rail
  ======================================================== */

  .dashboard-switcher {
    display:
      grid;

    gap:
      var(--space-4);

    margin-top:
      var(--space-8);

    font-family:
      "Space Mono",
      monospace;
  }


  .section-rail {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-6);

    overflow-x:
      auto;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .section-rail button {
    flex:
      0 0 auto;

    display:
      inline-flex;

    align-items:
      center;

    gap:
      var(--space-2);

    padding:
      var(--space-3) 0;

    background-color:
      transparent;

    color:
      var(--text-muted);

    border:
      0;

    border-bottom:
      1px solid
      transparent;

    font-size:
      calc(
        var(--font-size-base) *
        0.86
      );

    font-weight:
      600;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  .section-rail button:hover,
  .section-rail button.active {
    color:
      var(--primary);
  }


  .section-rail button.active {
    border-bottom-color:
      var(--primary);
  }


  .tab-count {
    min-width:
      var(--space-6);

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0 var(--space-2);

    background-color:
      var(--surface-strong);

    color:
      var(--text);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      var(--radius);

    font-variant-numeric:
      tabular-nums;
  }


  .section-panel,
  .panel-block {
    min-width:
      0;
  }


  .panel-block {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .panel-heading {
    display:
      flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .section-note {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  .panel-actions {
    display:
      flex;

    flex-wrap:
      wrap;

    justify-content:
      flex-end;

    gap:
      var(--space-2);
  }


  .text-action,
  .panel-actions a {
    color:
      var(--primary);

    text-decoration:
      none;
  }


  .text-action:hover,
  .panel-actions a:hover {
    text-decoration:
      underline;
  }


  /* ========================================================
     Results table
  ======================================================== */

  .attempt-table {
    display:
      grid;

    border-top:
      1px solid
      var(--border-soft);
  }


  .attempt-table-head,
  .attempt-row {
    display:
      grid;

    grid-template-columns:
      minmax(0, 2.5fr)
      minmax(70px, 0.7fr)
      minmax(70px, 0.7fr)
      minmax(110px, 0.9fr)
      auto;

    align-items:
      center;

    gap:
      var(--space-4);
  }


  .attempt-table-head {
    padding:
      var(--space-2) 0;

    color:
      var(--text-muted);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .attempt-row {
    min-height:
      60px;

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);

    font-variant-numeric:
      tabular-nums;
  }


  .attempt-row:hover {
    background-color:
      var(--surface-hover);
  }


  .attempt-test {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .attempt-test strong {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    font-size:
      var(--font-size-base);
  }


  .attempt-test span,
  .attempt-date {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );
  }


  .attempt-score,
  .attempt-correct {
    font-size:
      var(--font-size-base);
  }


  .score-positive {
    color:
      var(--success);
  }


  .score-negative {
    color:
      var(--danger);
  }


  .score-neutral {
    color:
      var(--text-muted);
  }


  .attempt-link {
    justify-self:
      end;

    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        0.86
      );

    font-weight:
      600;

    text-decoration:
      none;
  }


  .attempt-link:hover {
    text-decoration:
      underline;
  }


  /* ========================================================
     Leitner
  ======================================================== */

  .leitner-summary {
    min-height:
      104px;

    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding:
      var(--space-4) 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .metric-block {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-4);
  }


  .metric-block > strong {
    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        2.7
      );

    line-height:
      1;

    font-weight:
      500;

    font-variant-numeric:
      tabular-nums;
  }


  .metric-block div {
    display:
      grid;

    gap:
      var(--space-1);
  }


  .metric-block span {
    font-weight:
      600;
  }


  .metric-block p {
    color:
      var(--text-muted);
  }


  .primary-action,
  .secondary-action {
    min-height:
      var(--space-8);

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0 var(--space-3);

    border-radius:
      var(--radius);

    font-size:
      calc(
        var(--font-size-base) *
        0.86
      );

    font-weight:
      600;

    text-decoration:
      none !important;
  }


  .primary-action {
    background-color:
      var(--primary);

    color:
      var(--primary-text) !important;

    border:
      1px solid
      var(--primary);
  }


  .secondary-action {
    background-color:
      transparent;

    color:
      var(--text) !important;

    border:
      1px solid
      var(--border);
  }


  .secondary-action:hover {
    background-color:
      var(--surface-hover);
  }


  /* ========================================================
     Saved table
  ======================================================== */

  .saved-table {
    display:
      grid;

    border-top:
      1px solid
      var(--border-soft);
  }


  .saved-table-head,
  .saved-table-row {
    display:
      grid;

    grid-template-columns:
      minmax(0, 2.3fr)
      minmax(0, 1fr)
      minmax(0, 0.7fr)
      auto;

    gap:
      var(--space-4);

    align-items:
      center;
  }


  .saved-table-head {
    padding:
      var(--space-2) 0;

    color:
      var(--text-muted);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .saved-table-row {
    min-height:
      60px;

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .saved-table-row:hover {
    background-color:
      var(--surface-hover);
  }


  .saved-table-row.selected {
    background-color:
      var(--surface-hover);

    box-shadow:
      inset
      3px
      0
      0
      var(--primary);
  }


  .saved-question {
    min-width:
      0;

    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    color:
      var(--text);

    font-weight:
      500;
  }


  .saved-subtopic,
  .saved-main-topic {
    min-width:
      0;

    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    color:
      var(--text-muted);
  }


  .saved-open {
    text-align:
      right;
  }


  .saved-open a {
    color:
      var(--primary);

    font-weight:
      600;

    text-decoration:
      none;
  }


  .saved-open a:hover {
    text-decoration:
      underline;
  }


  .saved-empty {
    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-3);

    padding:
      var(--space-6) 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .saved-empty strong {
    color:
      var(--primary);
  }


  .saved-empty span {
    color:
      var(--text-muted);
  }


  /* ========================================================
     Available tests
  ======================================================== */

  .test-list {
    border-top:
      1px solid
      var(--border-soft);
  }


  .test-row {
    min-height:
      66px;

    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-4);

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .test-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .test-copy strong {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;
  }


  .test-copy span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );
  }


  .test-row > a {
    flex:
      0 0 auto;

    color:
      var(--primary);

    font-weight:
      600;

    text-decoration:
      none;
  }


  .test-row > a:hover {
    text-decoration:
      underline;
  }


  /* ========================================================
     Empty state
  ======================================================== */

  .empty-state {
    display:
      grid;

    gap:
      var(--space-1);

    padding:
      var(--space-4) 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .empty-state span {
    color:
      var(--text-muted);
  }


  /* ========================================================
     Responsive
  ======================================================== */

  @media (
    max-width: 800px
  ) {

    .saved-table {
      overflow-x:
        auto;
    }


    .saved-table-head,
    .saved-table-row {
      min-width:
        720px;
    }

  }


  @media (
    max-width: 720px
  ) {

    .dashboard-header,
    .panel-heading,
    .leitner-summary {
      align-items:
        flex-start;

      flex-direction:
        column;
    }


    .account-area {
      width:
        100%;

      justify-content:
        space-between;
    }


    .account-copy {
      text-align:
        left;
    }


    .panel-actions {
      justify-content:
        flex-start;
    }


    .attempt-table {
      overflow-x:
        auto;
    }


    .attempt-table-head,
    .attempt-row {
      min-width:
        650px;
    }

  }


  @media (
    max-width: 480px
  ) {

    .dashboard-page {
      width:
        calc(
          100% -
          var(--space-4)
        );

      padding-top:
        var(--space-4);
    }


    .panel-actions {
      width:
        100%;
    }


    .primary-action,
    .secondary-action {
      flex:
        1 1 auto;
    }

  }
</style>

<script>
  import SignOutButton
    from "$lib/components/auth/SignOutButton.svelte";

  import ThemeToggle
    from "$lib/components/theme/ThemeToggle.svelte";

  import AttemptProgressEqualizer
    from "$lib/components/AttemptProgressEqualizer.svelte";

  import LeitnerConcentricBoxes
    from "$lib/components/dashboard/LeitnerConcentricBoxes.svelte";

  import SavedQuestionsForceMap
    from "$lib/components/dashboard/SavedQuestionsForceMap.svelte";

  import StreakAttemptEqualizer
    from "$lib/components/dashboard/StreakAttemptEqualizer.svelte";

  import ModuleKnowledgeMap
    from "$lib/components/dashboard/ModuleKnowledgeMap.svelte";


  let { data } = $props();

  let activeSection =
    $state("tests");


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


  const primaryTest =
    $derived(
      tests.find(
        (test) =>
          !test.taken
      ) ??
      tests[0] ??
      null
    );


  const newTestCount =
    $derived(
      tests.filter(
        (test) =>
          !test.taken
      ).length
    );


  const takenTestCount =
    $derived(
      tests.length -
      newTestCount
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


  const streak =
    $derived(
      data.progress?.streak ??
      {
        current: 0,
        longest: 0,
        completedToday: false,
        atRisk: false,
        recentDays: []
      }
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
      <h1>
        {studentName}
      </h1>
    </div>


    <div class="account-area">
      <ThemeToggle />

      <div class="signout-wrap">
        <SignOutButton />
      </div>

    </div>

  </header>


  {#if activeSection === "tests"}
    <div class="insight-grid">
      <ModuleKnowledgeMap
        questions={data.leitnerVisualization ?? []}
      />

      <StreakAttemptEqualizer
        {streak}
        compact
      />
    </div>
  {/if}


  <!-- ======================================================
       PRIMARY STUDENT ACTIONS
  ======================================================= -->

  {#if activeSection === "tests"}
    <section class="priority-section" aria-label="Quick actions">
    <div class="priority-grid">
      <article class="priority-card revision-card featured">
        <div class="priority-card-topline">
          Revision due
        </div>

        <div class="priority-value">
          <strong>{dueCount}</strong>
          <span>{dueCount === 1 ? "question" : "questions"}</span>
        </div>

        <a
          class="priority-action primary"
          href={dueCount > 0
            ? "/student/revision/due"
            : "/student/revision/practice"}
        >
          {dueCount > 0
            ? "Begin review"
            : "Practice by box"}
          <span aria-hidden="true">→</span>
        </a>
      </article>


      <article class="priority-card examination-card">
        <div class="priority-card-topline">
          Examinations
        </div>

        <div class="priority-value">
          <strong>{newTestCount}</strong>
          <span>
            new · {takenTestCount} taken
          </span>
        </div>

        {#if primaryTest}
          <a
            class="priority-action"
            href={`/student/test/${primaryTest.id}`}
          >
            {primaryTest.taken ? "Retake" : "Start test"}
            <span aria-hidden="true">→</span>
          </a>
        {:else}
          <span class="priority-unavailable">
            None available
          </span>
        {/if}
      </article>


      <article class="priority-card saved-card">
        <div class="priority-card-topline">
          Saved practice
        </div>

        <div class="priority-value">
          <strong>{savedCount}</strong>
          <span>{savedCount === 1 ? "question" : "questions"}</span>
        </div>

        <a
          class="priority-action"
          href={savedCount > 0
            ? "/student/saved/practice"
            : "/student/saved"}
        >
          {savedCount > 0
            ? "Practice saved"
            : "View saved questions"}
          <span aria-hidden="true">→</span>
        </a>
      </article>
    </div>
    </section>
  {/if}


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
        class:active={activeSection === "tests"}
        aria-selected={activeSection === "tests"}
        aria-controls="tests-panel"
        onclick={() => {
          activeSection = "tests";
        }}
      >
        Tests
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
        Revision
      </button>


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
        class:active={activeSection === "saved"}
        aria-selected={activeSection === "saved"}
        aria-controls="saved-panel"
        onclick={() => {
          activeSection = "saved";
        }}
      >
        Saved
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

              <!-- <strong>
                {dueCount}
              </strong> -->

              <div>
                <!-- <span>
                  Due now
                </span> -->

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
          aria-label="Tests"
        >

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

                <article
                  class:taken={test.taken}
                  class="test-row"
                >

                  <div class="test-copy">

                    <div class="test-titleline">
                      <strong>
                        {test.title}
                      </strong>

                      {#if test.taken}
                        <span class="taken-label">
                          Taken
                        </span>
                      {/if}
                    </div>

                    <span>
                      {test.questionCount} questions ·
                      {test.durationMinutes} min
                    </span>

                  </div>


                  <a href={`/student/test/${test.id}`}>
                    {test.taken ? "Retake" : "Start"} →
                  </a>

                </article>

              {/each}

            </div>

          {/if}

        </section>

      {/if}

    </div>

  </section>


  <!-- ======================================================
       SUPPORTING VISUALIZATION
  ======================================================= -->

  {#if activeSection !== "tests"}
    <section
      class="dashboard-viz"
      aria-label="Section visualization"
    >

    {#if activeSection === "results"}

      <AttemptProgressEqualizer
        attempts={progressAttempts}
        totalAttempts={data.progress?.attemptCount ?? progressAttempts.length}
      />


    {:else if activeSection === "leitner"}

      <LeitnerConcentricBoxes
        questions={data.leitnerVisualization ?? []}
      />


    {:else if activeSection === "saved"}

      <SavedQuestionsForceMap
        questions={savedQuestions}
        selectedId={selectedSavedId}
        onSelect={locateSavedQuestion}
      />


    {/if}

    </section>
  {/if}

</div>


<style>
  .dashboard-page {
    width:
      calc(
        100% -
        var(--space-8)
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
      var(--font-ui);
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
      var(--font-ui);
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

    font-family:
      var(--font-metadata);
  }


  .signout-wrap :global(button) {
    min-height:
      36px;

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
     Daily study streak
  ======================================================== */

  .streak-card {
    display:
      grid;

    grid-template-columns:
      auto
      minmax(220px, 1fr)
      auto
      auto;

    align-items:
      center;

    gap:
      var(--space-4);

    margin-top:
      var(--space-6);

    padding:
      var(--space-4);

    background:
      linear-gradient(
        115deg,
        color-mix(
          in srgb,
          var(--primary) 8%,
          var(--surface)
        ),
        var(--surface)
      );

    border:
      1px solid
      color-mix(
        in srgb,
        var(--primary) 34%,
        var(--border-soft)
      );

    border-radius:
      var(--radius);
  }


  .sr-only {
    position:
      absolute;

    width:
      1px;

    height:
      1px;

    padding:
      0;

    margin:
      -1px;

    overflow:
      hidden;

    clip:
      rect(0, 0, 0, 0);

    white-space:
      nowrap;

    border:
      0;
  }


  .streak-card.complete {
    border-color:
      color-mix(
        in srgb,
        var(--success) 50%,
        var(--border-soft)
      );
  }


  .streak-card.at-risk {
    border-color:
      color-mix(
        in srgb,
        var(--danger) 58%,
        var(--border-soft)
      );
  }


  .streak-mark {
    width:
      52px;

    aspect-ratio:
      1;

    display:
      grid;

    place-items:
      center;

    background:
      color-mix(
        in srgb,
        var(--primary) 15%,
        var(--surface-strong)
      );

    color:
      var(--primary);

    border:
      1px solid
      color-mix(
        in srgb,
        var(--primary) 42%,
        var(--border)
      );

    border-radius:
      50%;

    font-size:
      22px;

    transform:
      rotate(45deg);
  }


  .streak-mark span {
    transform:
      rotate(-45deg);
  }


  .streak-card.complete .streak-mark {
    color:
      var(--success);
  }


  .streak-card.at-risk .streak-mark {
    color:
      var(--danger);
  }


  .streak-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .streak-titleline {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-3);
  }


  .streak-titleline > strong {
    color:
      var(--primary);

    font-family:
      var(--font-heading);

    font-size:
      calc(
        var(--font-size-base) *
        2.9
      );

    line-height:
      1;

    font-weight:
      600;

    font-variant-numeric:
      tabular-nums;
  }


  .streak-titleline p {
    margin-top:
      var(--space-1);

    color:
      var(--text-muted);

    font-family:
      var(--font-reading);
  }


  .streak-week {
    display:
      grid;

    grid-template-columns:
      repeat(7, 24px);

    gap:
      var(--space-1);
  }


  .streak-day {
    display:
      grid;

    justify-items:
      center;

    gap:
      5px;

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      10px;
  }


  .streak-day i {
    width:
      12px;

    height:
      12px;

    background:
      var(--surface-strong);

    border:
      1px solid
      var(--border);

    border-radius:
      50%;
  }


  .streak-day.active i {
    background:
      var(--primary);

    border-color:
      var(--primary);

    box-shadow:
      0 0 0 3px
      color-mix(
        in srgb,
        var(--primary) 12%,
        transparent
      );
  }


  .streak-day.today span:first-child {
    color:
      var(--text);

    font-weight:
      600;
  }


  .streak-record {
    display:
      grid;

    gap:
      3px;

    padding-left:
      var(--space-4);

    border-left:
      1px solid
      var(--border-soft);

    white-space:
      nowrap;
  }


  .streak-record span {
    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    text-transform:
      uppercase;
  }


  .streak-record strong {
    font-family:
      var(--font-heading);

    font-size:
      calc(
        var(--font-size-base) *
        1.05
      );
  }


  /* ========================================================
     Primary actions
  ======================================================== */

  .priority-section {
    display:
      grid;

    gap:
      var(--space-4);

    margin-top:
      var(--space-8);
  }


  .priority-heading {
    display:
      flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .priority-grid {
    display:
      grid;

    grid-template-columns:
      minmax(0, 1.75fr)
      repeat(2, minmax(0, 1fr));

    gap:
      var(--space-3);
  }


  .priority-card {
    position:
      relative;

    min-width:
      0;

    min-height:
      286px;

    display:
      flex;

    flex-direction:
      column;

    gap:
      var(--space-2);

    padding:
      var(--space-4);

    background-color:
      var(--surface-strong);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      14px;

    overflow:
      hidden;
  }


  .priority-card::after {
    position:
      absolute;

    top:
      38%;

    right:
      -3px;

    width:
      7px;

    height:
      76px;

    content:
      "";

    background:
      radial-gradient(
        circle,
        var(--border) 0 1.5px,
        transparent 1.8px
      ) center / 7px 12px repeat-y;

    opacity:
      0.75;
  }


  .priority-card > :not(.card-orbits) {
    position:
      relative;

    z-index:
      2;
  }


  .priority-card.featured {
    background:
      linear-gradient(
        135deg,
        color-mix(
          in srgb,
          var(--success) 5%,
          var(--surface-strong)
        ),
        var(--surface-strong)
      );

    border-color:
      color-mix(
        in srgb,
        var(--success) 48%,
        var(--border-soft)
      );
  }


  .priority-card-topline {
    display:
      flex;

    align-items:
      flex-start;

    flex-direction:
      column;

    justify-content:
      flex-start;

    gap:
      var(--space-2);

    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.76
      );

    letter-spacing:
      0.07em;

    text-transform:
      uppercase;
  }


  .status-dots {
    display:
      inline-flex;

    align-items:
      center;

    gap:
      4px;
  }


  .status-dots i {
    width:
      9px;

    height:
      9px;

    display:
      block;

    border:
      1px solid
      color-mix(
        in srgb,
        var(--success) 55%,
        var(--border)
      );

    border-radius:
      50%;
  }


  .status-dots i.active {
    background:
      var(--success);

    border-color:
      var(--success);
  }


  .examination-card .status-dots i {
    border-color:
      color-mix(
        in srgb,
        var(--primary) 58%,
        var(--border)
      );
  }


  .examination-card .status-dots i.active {
    background:
      var(--primary);

    border-color:
      var(--primary);
  }


  .saved-card .status-dots i {
    border-color:
      var(--border);
  }


  .saved-card .status-dots i.active {
    background:
      var(--text-muted);

    border-color:
      var(--text-muted);
  }


  .priority-number {
    margin-top:
      var(--space-1);

    color:
      var(--text-muted);

    font-family:
      var(--font-heading);

    font-size:
      clamp(34px, 4vw, 44px);

    line-height:
      1;

    font-weight:
      600;

    font-variant-numeric:
      tabular-nums;
  }


  .revision-card .priority-number {
    color:
      var(--success);
  }


  .examination-card .priority-number {
    color:
      var(--primary);
  }


  .priority-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .priority-copy h3 {
    margin:
      0;

    overflow:
      hidden;

    color:
      var(--text);

    font-size:
      calc(
        var(--font-size-base) *
        1.18
      );

    line-height:
      1.35;

    font-weight:
      600;
  }


  .priority-copy p {
    color:
      var(--text-muted);

    line-height:
      1.5;

    font-family:
      var(--font-reading);
  }


  .priority-action,
  .priority-unavailable {
    min-height:
      56px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-3);

    margin-top:
      auto;

    padding:
      0 var(--space-4);

    border-radius:
      var(--radius);

    font-weight:
      600;
  }


  .priority-action {
    color:
      var(--text);

    border:
      1px solid
      var(--border);

    text-decoration:
      none;
  }


  .priority-action > span {
    width:
      50px;

    align-self:
      stretch;

    display:
      grid;

    place-items:
      center;

    margin-right:
      calc(var(--space-4) * -1);

    border-left:
      1px solid
      color-mix(
        in srgb,
        currentColor 24%,
        transparent
      );

    font-size:
      19px;
  }


  .priority-action:hover {
    background-color:
      var(--surface-hover);

    border-color:
      var(--primary);
  }


  .priority-action.primary {
    background-color:
      var(--primary);

    color:
      var(--primary-text);

    border-color:
      var(--primary);
  }


  .priority-action.primary:hover {
    background-color:
      color-mix(
        in srgb,
        var(--primary) 88%,
        white
      );

    border-color:
      var(--primary);
  }


  .priority-unavailable {
    color:
      var(--text-muted);

    border:
      1px dashed
      var(--border-soft);
  }


  .card-orbits {
    position:
      absolute;

    right:
      -54px;

    bottom:
      -82px;

    z-index:
      1;

    width:
      190px;

    height:
      190px;

    pointer-events:
      none;
  }


  .card-orbits i {
    position:
      absolute;

    right:
      0;

    bottom:
      0;

    border:
      1px solid
      color-mix(
        in srgb,
        var(--border) 65%,
        transparent
      );

    border-radius:
      50%;
  }


  .card-orbits i:nth-child(1) {
    width:
      94px;

    height:
      94px;
  }


  .card-orbits i:nth-child(2) {
    width:
      140px;

    height:
      140px;
  }


  .card-orbits i:nth-child(3) {
    width:
      186px;

    height:
      186px;
  }


  /* ========================================================
     Supporting visualization
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
      var(--font-ui);
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

    scrollbar-width:
      none;
  }


  .section-rail::-webkit-scrollbar {
    display:
      none;
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

    font-family:
      var(--font-metadata);
  }


  .attempt-score,
  .attempt-correct {
    font-family:
      var(--font-heading);

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

    font-family:
      var(--font-heading);

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
     Tests
  ======================================================== */

  .test-list {
    display:
      grid;
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
      var(--space-3)
      var(--space-3)
      var(--space-3)
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);

    border-left:
      2px solid
      transparent;
  }


  .test-row:first-child {
    border-top:
      1px solid
      var(--border-soft);
  }


  .test-row.taken {
    background:
      linear-gradient(
        90deg,
        color-mix(
          in srgb,
          var(--success) 9%,
          transparent
        ),
        transparent 34%
      );

    border-left-color:
      var(--success);
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


  .test-titleline {
    min-width:
      0;

    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-2);
  }


  .taken-label {
    flex:
      0 0 auto;

    padding:
      2px var(--space-2);

    color:
      var(--success);

    border:
      1px solid
      color-mix(
        in srgb,
        var(--success) 48%,
        transparent
      );

    border-radius:
      999px;

    font-family:
      var(--font-metadata);

    font-size:
      calc(
        var(--font-size-base) *
        0.68
      );

    font-weight:
      700;

    letter-spacing:
      0.06em;

    line-height:
      1.2;

    text-transform:
      uppercase;
  }


  .test-copy span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.8
      );

    font-family:
      var(--font-metadata);
  }


  .test-row > a {
    flex:
      0 0 auto;

    min-width:
      84px;

    min-height:
      40px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0 var(--space-3);

    color:
      var(--primary);

    border:
      1px solid
      color-mix(
        in srgb,
        var(--primary) 46%,
        var(--border-soft)
      );

    border-radius:
      999px;

    font-weight:
      600;

    text-decoration:
      none;
  }


  .test-row > a:hover {
    background:
      color-mix(
        in srgb,
        var(--primary) 10%,
        transparent
      );

    border-color:
      var(--primary);
  }


  .test-row.taken > a {
    color:
      var(--success);

    border-color:
      color-mix(
        in srgb,
        var(--success) 46%,
        var(--border-soft)
      );
  }


  .test-row.taken > a:hover {
    background:
      color-mix(
        in srgb,
        var(--success) 10%,
        transparent
      );

    border-color:
      var(--success);
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

    .streak-card {
      grid-template-columns:
        auto
        minmax(0, 1fr)
        auto;
    }


    .streak-week {
      grid-column:
        2 / -1;

      justify-content:
        start;
    }

    .priority-grid {
      grid-template-columns:
        1fr 1fr;
    }


    .priority-card.featured {
      grid-column:
        1 / -1;
    }

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

    .streak-card {
      grid-template-columns:
        auto
        minmax(0, 1fr);
    }


    .streak-week {
      grid-column:
        1 / -1;
    }


    .streak-record {
      grid-column:
        1 / -1;

      grid-template-columns:
        1fr auto;

      align-items:
        baseline;

      padding:
        var(--space-3) 0 0;

      border-top:
        1px solid
        var(--border-soft);

      border-left:
        0;
    }

    .dashboard-header,
    .priority-heading,
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

    .streak-card {
      gap:
        var(--space-3);

      padding:
        var(--space-3);
    }


    .streak-mark {
      width:
        42px;
    }


    .streak-titleline {
      align-items:
        flex-start;
    }


    .streak-titleline > strong {
      font-size:
        calc(
          var(--font-size-base) *
          2.25
        );
    }


    .streak-week {
      grid-template-columns:
        repeat(7, minmax(22px, 1fr));

      width:
        100%;
    }

    .dashboard-page {
      width:
        calc(
          100% -
          var(--space-4)
        );

      padding-top:
        var(--space-4);
    }


    .priority-grid {
      grid-template-columns:
        1fr;
    }


    .priority-card.featured {
      grid-column:
        auto;
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


  /* ========================================================
     Compact transparent action strip
  ======================================================== */

  .insight-grid {
    display:
      grid;

    grid-template-columns:
      minmax(0, 1.7fr)
      minmax(340px, 0.8fr);

    align-items:
      stretch;

    gap:
      var(--space-6);
  }

  .priority-section {
    margin-top:
      var(--space-4);

    gap:
      0;
  }


  .priority-grid {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );

    gap:
      0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .priority-card,
  .priority-card.featured {
    min-height:
      118px;

    display:
      grid;

    grid-template-columns:
      minmax(0, 1fr)
      auto;

    grid-template-rows:
      auto
      1fr;

    grid-column:
      auto;

    align-items:
      end;

    gap:
      var(--space-3);

    padding:
      var(--space-4)
      var(--space-4);

    background:
      transparent;

    border:
      0;

    border-right:
      1px solid
      var(--border-soft);

    border-radius:
      0;

    overflow:
      visible;
  }


  .priority-card:last-child {
    border-right:
      0;
  }


  .priority-card::after {
    content:
      none;
  }


  .priority-card-topline {
    grid-column:
      1 / -1;

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    font-weight:
      600;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  .priority-value {
    min-width:
      0;

    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-2);
  }


  .priority-value strong {
    color:
      var(--text);

    font-family:
      var(--font-heading);

    font-size:
      clamp(
        28px,
        3.2vw,
        42px
      );

    font-weight:
      600;

    line-height:
      1;

    font-variant-numeric:
      tabular-nums;
  }


  .priority-value span {
    overflow:
      hidden;

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    text-overflow:
      ellipsis;

    white-space:
      nowrap;
  }


  .revision-card .priority-value strong {
    color:
      var(--success);
  }


  .examination-card .priority-value strong {
    color:
      var(--primary);
  }


  .priority-action,
  .priority-unavailable {
    min-height:
      34px;

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    gap:
      var(--space-2);

    margin-top:
      0;

    padding:
      0 var(--space-3);

    border-radius:
      999px;

    font-size:
      calc(
        var(--font-size-base) *
        0.76
      );

    font-weight:
      600;

    white-space:
      nowrap;
  }


  .priority-action {
    background:
      transparent;

    color:
      var(--primary);

    border:
      1px solid
      color-mix(
        in srgb,
        var(--primary) 52%,
        var(--border)
      );
  }


  .priority-action:hover {
    background:
      color-mix(
        in srgb,
        var(--primary) 10%,
        transparent
      );

    border-color:
      var(--primary);
  }


  .priority-action.primary {
    background:
      var(--primary);

    color:
      var(--primary-text);

    border-color:
      var(--primary);
  }


  .priority-action > span {
    width:
      auto;

    align-self:
      auto;

    margin-right:
      0;

    border-left:
      0;

    font-size:
      15px;
  }


  .priority-unavailable {
    color:
      var(--text-muted);

    border:
      1px dashed
      var(--border-soft);
  }


  @media (
    max-width: 760px
  ) {

    .priority-card,
    .priority-card.featured {
      padding:
        var(--space-3);
    }


    .priority-value {
      align-items:
        flex-start;

      flex-direction:
        column;

      gap:
        3px;
    }

  }


  @media (
    max-width: 960px
  ) {

    .insight-grid {
      grid-template-columns:
        1fr;

      gap:
        0;
    }

  }


  @media (
    max-width: 600px
  ) {

    .priority-grid {
      grid-template-columns:
        1fr;
    }


    .priority-card,
    .priority-card.featured {
      min-height:
        84px;

      grid-template-columns:
        minmax(0, 1fr)
        auto;

      grid-template-rows:
        auto
        auto;

      padding:
        var(--space-3)
        var(--space-2);

      border-right:
        0;

      border-bottom:
        1px solid
        var(--border-soft);
    }


    .priority-card:last-child {
      border-bottom:
        0;
    }


    .priority-card-topline {
      grid-column:
        1;
    }


    .priority-action,
    .priority-unavailable {
      grid-column:
        2;

      grid-row:
        1 / 3;

      align-self:
        center;
    }


    .priority-value {
      align-items:
        baseline;

      flex-direction:
        row;
    }

  }
</style>

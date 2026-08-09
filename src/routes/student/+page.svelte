<script>
    import '@fontsource/space-mono/400.css';
  import '@fontsource/space-mono/700.css';
  import SignOutButton from "$lib/components/auth/SignOutButton.svelte";

  import AttemptProgressEqualizer from "$lib/components/AttemptProgressEqualizer.svelte";

  let { data } = $props();

  const studentName =
    data.profile?.displayName ??
    data.user?.name ??
    data.user?.email ??
    "Student";

  function formatScore(score) {
    if (score === null || score === undefined) {
      return "—";
    }

    const value = Number(score);

    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString();
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
    <div>
      <p class="eyebrow">Student</p>

      <h1>Progress</h1>
    </div>

    <div class="account-area">
      <div class="account-copy">
        <strong>
          {studentName}
        </strong>

        <span>
          {data.user.email}
        </span>
      </div>

      <div class="signout-wrap">
        <SignOutButton />
      </div>
    </div>
  </header>

  <!-- ======================================================
       ATTEMPT PROGRESS
  ======================================================= -->

  <section class="progress-section" aria-labelledby="progress-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Performance</p>

        <h2 id="progress-heading">Attempts</h2>
      </div>

      <p class="section-note">
        Last attempt ·
        {formatDate(data.progress.lastAttemptAt)}
      </p>
    </div>

    <AttemptProgressEqualizer
      attempts={data.progress.progressAttempts ?? []}
      totalAttempts={data.progress.attemptCount}
    />
  </section>

  <!-- ======================================================
       REVISION
  ======================================================= -->

  <section class="dashboard-section" aria-labelledby="revision-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Leitner</p>

        <h2 id="revision-heading">Revision</h2>
      </div>

      <a class="section-link" href="/student/revision">
        Open revision
        <span aria-hidden="true"> → </span>
      </a>
    </div>

    <div class="revision-row">
      <div class="revision-count">
        <strong>
          {data.revision.dueCount}
        </strong>

        <div>
          <span> Due now </span>

          <p>Questions scheduled for review.</p>
        </div>
      </div>

      <div class="revision-actions">
        {#if data.revision.dueCount > 0}
          <a class="primary-action" href="/student/revision/due">
            Start Due Review
          </a>
        {:else}
          <span class="revision-clear"> Nothing due </span>
        {/if}

        <a class="secondary-action" href="/student/revision"> Revise Now </a>
      </div>
    </div>
  </section>

  <!-- ======================================================
       AVAILABLE TESTS
  ======================================================= -->

  <section class="dashboard-section" aria-labelledby="tests-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Examination</p>

        <h2 id="tests-heading">Available Tests</h2>
      </div>

      <span class="section-note">
        {data.tests.length}
        available
      </span>
    </div>

    {#if data.tests.length === 0}
      <div class="empty-state">
        <strong> No tests available. </strong>

        <span> New tests will appear here when published. </span>
      </div>
    {:else}
      <div class="test-list">
        {#each data.tests as test}
          <article class="test-row">
            <div class="test-copy">
              <strong>
                {test.title}
              </strong>

              <span>
                {test.questionCount}
                questions ·

                {test.durationMinutes}
                min
              </span>
            </div>

            <a href={`/student/test/${test.id}`}>
              Start

              <span aria-hidden="true"> → </span>
            </a>
          </article>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ======================================================
       RECENT ATTEMPTS
  ======================================================= -->

  <section class="dashboard-section" aria-labelledby="history-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">History</p>

        <h2 id="history-heading">Recent Attempts</h2>
      </div>
    </div>

    {#if data.progress.recentAttempts.length === 0}
      <div class="empty-state">
        <strong> No completed attempts. </strong>

        <span> Completed tests will appear here. </span>
      </div>
    {:else}
      <div class="attempt-table">
        <div class="attempt-head" aria-hidden="true">
          <span>Test</span>
          <span>Score</span>
          <span>Correct</span>
          <span>Date</span>
          <span></span>
        </div>

        {#each data.progress.recentAttempts as attempt}
          <div class="attempt-row">
            <div class="attempt-test">
              <strong>
                {attempt.testTitle}
              </strong>

              <span>
                {attempt.wrong}
                wrong ·

                {attempt.skipped}
                skipped
              </span>
            </div>

            <strong class="attempt-score">
              {formatScore(attempt.score)}
            </strong>

            <span>
              {attempt.correct}
            </span>

            <span class="attempt-date">
              {formatDate(attempt.completedAt)}
            </span>

            <a href={`/student/results/${attempt.id}`}>
              Result

              <span aria-hidden="true"> → </span>
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .dashboard-page {
    width: min(calc(100% - var(--space-8)), var(--page-width));

    margin-inline: auto;

    padding: var(--space-6) 0 var(--space-8);
    font-family:
    'Space Mono',
    monospace;
    color: var(--verdigris-gold);
  }

  /* ========================================================
     Header
  ======================================================== */

  .dashboard-header {
    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: var(--space-6);

    padding-bottom: var(--space-5);

    border-bottom: 1px solid var(--border-soft);
  }

  .eyebrow,
  .section-kicker {
    margin: 0 0 var(--space-1);

   color:  #6cb09b;
    font-size: 10px;

    font-weight: 600;

    letter-spacing: 0.08em;

    text-transform: uppercase;
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  h1 {
    color: var(--primary);

    font-size: 27px;

    line-height: 1.15;

    font-weight: 600;
  }

  h2 {
    color: var(--text);

    font-size: 16px;

    line-height: 1.25;

    font-weight: 600;
  }

  .account-area {
    display: flex;

    align-items: center;

    gap: var(--space-3);
  }

  .account-copy {
    min-width: 0;

    display: grid;

    gap: 2px;

    text-align: right;
  }

  .account-copy strong {
    font-size: 12px;

    font-weight: 600;
  }

  .account-copy span {
    max-width: 240px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    color: var(--text-muted);

    font-size: 10px;
  }

  .signout-wrap :global(button) {
    min-height: 34px;

    padding: 0 var(--space-3);

    background: transparent;

    color: var(--text-muted);

    border: 1px solid var(--border-soft);

    border-radius: var(--radius);
  }

  .signout-wrap :global(button:hover) {
    color: var(--text);

    border-color: var(--border);
  }

  /* ========================================================
     Sections
  ======================================================== */

  .progress-section,
  .dashboard-section {
    margin-top: var(--space-8);
  }

  .section-heading {
    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: var(--space-4);

    margin-bottom: var(--space-4);
  }

  .section-note {
    color: var(--text-muted);

    font-size: 10px;
  }

  .section-link {
    color: var(--primary);

    font-size: 11px;

    font-weight: 600;

    text-decoration: none;
  }

  /* ========================================================
     Revision
  ======================================================== */

  .revision-row {
    min-height: 104px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: var(--space-6);

    padding: var(--space-4) 0;

    border-top: 1px solid var(--border-soft);

    border-bottom: 1px solid var(--border-soft);
  }

  .revision-count {
    display: flex;

    align-items: center;

    gap: var(--space-4);
  }

  .revision-count > strong {
    color: var(--primary);

    font-size: 38px;

    line-height: 1;

    font-weight: 500;

    font-variant-numeric: tabular-nums;
  }

  .revision-count div {
    display: grid;

    gap: 3px;
  }

  .revision-count span {
    font-size: 12px;

    font-weight: 600;
  }

  .revision-count p {
    color: var(--text-muted);

    font-size: 11px;
  }

  .revision-actions {
    display: flex;

    align-items: center;

    gap: var(--space-2);
  }

  .primary-action,
  .secondary-action {
    min-height: 36px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    padding: 0 var(--space-3);

    border-radius: var(--radius);

    font-size: 11px;

    font-weight: 600;

    text-decoration: none;
  }

  .primary-action {
    background: var(--primary);

    color: var(--primary-text);
  }

  .secondary-action {
    color: var(--text);

    border: 1px solid var(--border);
  }

  .revision-clear {
    color: var(--text-muted);

    font-size: 11px;
  }

  /* ========================================================
     Tests
  ======================================================== */

  .test-list {
    border-top: 1px solid var(--border-soft);
  }

  .test-row {
    min-height: 66px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: var(--space-5);

    padding: var(--space-3) 0;

    border-bottom: 1px solid var(--border-soft);
  }

  .test-copy {
    min-width: 0;

    display: grid;

    gap: 4px;
  }

  .test-copy strong {
    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    font-size: 13px;

    font-weight: 600;
  }

  .test-copy span {
    color: var(--text-muted);

    font-size: 10px;
  }

  .test-row > a {
    flex: 0 0 auto;

    min-width: 72px;

    display: inline-flex;

    align-items: center;

    justify-content: flex-end;

    gap: var(--space-2);

    color: var(--primary);

    font-size: 11px;

    font-weight: 600;

    text-decoration: none;
  }

  /* ========================================================
     Attempts
  ======================================================== */

  .attempt-table {
    border-top: 1px solid var(--border-soft);
  }

  .attempt-head,
  .attempt-row {
    display: grid;

    grid-template-columns:
      minmax(200px, 1fr)
      80px
      80px
      110px
      70px;

    align-items: center;

    gap: var(--space-4);
  }

  .attempt-head {
    padding: var(--space-2) 0;

    color: var(--text-muted);

    border-bottom: 1px solid var(--border-soft);

    font-size: 9px;

    font-weight: 600;

    letter-spacing: 0.06em;

    text-transform: uppercase;
  }

  .attempt-row {
    min-height: 61px;

    padding: var(--space-2) 0;

    border-bottom: 1px solid var(--border-soft);

    font-size: 11px;

    font-variant-numeric: tabular-nums;
  }

  .attempt-row:hover {
    background: var(--surface-hover);
  }

  .attempt-test {
    min-width: 0;

    display: grid;

    gap: 3px;
  }

  .attempt-test strong {
    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    font-size: 12px;
  }

  .attempt-test span,
  .attempt-date {
    color: var(--text-muted);

    font-size: 10px;
  }

  .attempt-score {
    color: var(--primary);

    font-size: 14px;
  }

  .attempt-row > a {
    justify-self: end;

    color: var(--primary);

    font-size: 10px;

    font-weight: 600;

    text-decoration: none;
  }

  /* ========================================================
     Empty
  ======================================================== */

  .empty-state {
    display: grid;

    gap: var(--space-1);

    padding: var(--space-5) 0;

    border-top: 1px solid var(--border-soft);

    border-bottom: 1px solid var(--border-soft);
  }

  .empty-state strong {
    font-size: 12px;
  }

  .empty-state span {
    color: var(--text-muted);

    font-size: 11px;
  }

  /* ========================================================
     Responsive
  ======================================================== */

  @media (max-width: 720px) {
    .dashboard-header {
      flex-direction: column;
    }

    .account-area {
      width: 100%;

      justify-content: space-between;
    }

    .account-copy {
      text-align: left;
    }

    .revision-row {
      align-items: flex-start;

      flex-direction: column;
    }

    .revision-actions {
      width: 100%;
    }

    .attempt-table {
      overflow-x: auto;
    }

    .attempt-head,
    .attempt-row {
      min-width: 650px;
    }
  }

  @media (max-width: 480px) {
    .dashboard-page {
      width: calc(100% - 20px);

      padding-top: var(--space-4);
    }

    .section-heading {
      align-items: flex-start;

      flex-direction: column;

      gap: var(--space-2);
    }

    .revision-actions {
      flex-direction: column;

      align-items: stretch;
    }

    .primary-action,
    .secondary-action {
      width: 100%;
    }
  }
</style>

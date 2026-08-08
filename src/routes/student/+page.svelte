<script>
  import SignOutButton
    from '$lib/components/auth/SignOutButton.svelte';

  let {
    data
  } = $props();


  function formatScore(
    score
  ) {
    if (score === null) {
      return '—';
    }

    return Number(
      score
    ).toFixed(2);
  }


  function formatDate(
    value
  ) {
    if (!value) {
      return '—';
    }

    return new Date(
      value
    ).toLocaleString();
  }
</script>


<svelte:head>
  <title>
    Student Dashboard
  </title>
</svelte:head>


<div class="dashboard-page">
  <header class="dashboard-header">
    <div class="heading-group">
      <p class="eyebrow">
        Student
      </p>

      <h1>
        Dashboard
      </h1>

      <p class="subtitle">
        Tests, revision, progress and recent activity.
      </p>
    </div>

    <div class="account-area">
      <div class="account-copy">
        <span class="account-label">
          Signed in as
        </span>

        <strong>
          {data.user.email}
        </strong>
      </div>

      <div class="signout-wrap">
        <SignOutButton />
      </div>
    </div>
  </header>


  <section
    class="dashboard-section"
    aria-labelledby="progress-heading"
  >
    <div class="section-heading">
      <div>
        <p class="section-kicker">
          Overview
        </p>

        <h2 id="progress-heading">
          Progress
        </h2>
      </div>

      <p class="section-note">
        Last attempt:
        {formatDate(
          data.progress.lastAttemptAt
        )}
      </p>
    </div>

    <div class="stat-grid">
      <article class="stat-card">
        <span class="stat-label">
          Attempts
        </span>

        <strong class="stat-value">
          {data.progress.attemptCount}
        </strong>

        <span class="stat-caption">
          completed
        </span>
      </article>

      <article class="stat-card">
        <span class="stat-label">
          Latest score
        </span>

        <strong class="stat-value primary-value">
          {formatScore(
            data.progress.latestScore
          )}
        </strong>

        <span class="stat-caption">
          most recent attempt
        </span>
      </article>

      <article class="stat-card">
        <span class="stat-label">
          Best score
        </span>

        <strong class="stat-value success-value">
          {formatScore(
            data.progress.bestScore
          )}
        </strong>

        <span class="stat-caption">
          personal best
        </span>
      </article>

      <article class="stat-card">
        <span class="stat-label">
          Average score
        </span>

        <strong class="stat-value">
          {formatScore(
            data.progress.averageScore
          )}
        </strong>

        <span class="stat-caption">
          across attempts
        </span>
      </article>
    </div>
  </section>


  <section
    class="dashboard-section"
    aria-labelledby="revision-heading"
  >
    <div class="section-heading">
      <div>
        <p class="section-kicker">
          Revision
        </p>

        <h2 id="revision-heading">
          Leitner Review
        </h2>
      </div>

      <a
        class="text-link"
        href="/student/revision"
      >
        Open revision
        <span aria-hidden="true">
          →
        </span>
      </a>
    </div>

    <div class="revision-panel">
      <div class="revision-summary">
        <span class="revision-label">
          Due now
        </span>

        <strong class="revision-count">
          {data.revision.dueCount}
        </strong>

        <p>
          Questions currently scheduled
          for Leitner review.
        </p>
      </div>

      <div class="revision-actions">
        {#if data.revision.dueCount > 0}
          <a
            class="revision-primary"
            href="/student/revision/due"
          >
            Start Due Review
            <span aria-hidden="true">
              →
            </span>
          </a>
        {:else}
          <span class="revision-status">
            Nothing is currently due.
          </span>
        {/if}

        <a
          class="revision-secondary"
          href="/student/revision"
        >
          Revise Now
        </a>
      </div>
    </div>
  </section>


  <section
    class="dashboard-section"
    aria-labelledby="tests-heading"
  >
    <div class="section-heading">
      <div>
        <p class="section-kicker">
          Examination
        </p>

        <h2 id="tests-heading">
          Available Tests
        </h2>
      </div>

      <span class="section-count">
        {data.tests.length}
        available
      </span>
    </div>

    {#if data.tests.length === 0}
      <div class="empty-state">
        <strong>
          No tests are available.
        </strong>

        <span>
          New tests will appear here when they are published.
        </span>
      </div>
    {:else}
      <div class="test-list">
        <div
          class="test-list-head"
          aria-hidden="true"
        >
          <span>Test</span>
          <span>Questions</span>
          <span>Duration</span>
          <span></span>
        </div>

        {#each data.tests as test}
          <article class="test-row">
            <div class="test-title">
              <strong>
                {test.title}
              </strong>
            </div>

            <div class="test-meta">
              <span class="mobile-label">
                Questions
              </span>

              <strong>
                {test.questionCount}
              </strong>
            </div>

            <div class="test-meta">
              <span class="mobile-label">
                Duration
              </span>

              <strong>
                {test.durationMinutes}
                min
              </strong>
            </div>

            <a
              class="start-test"
              href={`/student/test/${test.id}`}
            >
              Start Test
              <span aria-hidden="true">
                →
              </span>
            </a>
          </article>
        {/each}
      </div>
    {/if}
  </section>


  <section
    class="dashboard-section"
    aria-labelledby="attempts-heading"
  >
    <div class="section-heading">
      <div>
        <p class="section-kicker">
          History
        </p>

        <h2 id="attempts-heading">
          Recent Attempts
        </h2>
      </div>

      <a
        class="text-link"
        href="/results"
      >
        View full history
        <span aria-hidden="true">
          →
        </span>
      </a>
    </div>

    {#if data.progress.recentAttempts.length === 0}
      <div class="empty-state">
        <strong>
          No attempts completed yet.
        </strong>

        <span>
          Completed tests will appear here.
        </span>
      </div>
    {:else}
      <div class="table-panel">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Skipped</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {#each data.progress.recentAttempts as attempt}
                <tr>
                  <td class="attempt-title">
                    {attempt.testTitle}
                  </td>

                  <td class="score-cell">
                    {formatScore(
                      attempt.score
                    )}
                  </td>

                  <td class="correct-cell">
                    {attempt.correct}
                  </td>

                  <td class="wrong-cell">
                    {attempt.wrong}
                  </td>

                  <td class="skipped-cell">
                    {attempt.skipped}
                  </td>

                  <td class="date-cell">
                    {formatDate(
                      attempt.completedAt
                    )}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </section>
</div>


<style>
  .dashboard-page {
    width: min(
      calc(100% - 32px),
      var(--page-width)
    );

    margin-inline: auto;

    padding:
      var(--space-6)
      0
      var(--space-8);
  }

  .dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);

    padding-bottom: var(--space-6);

    border-bottom:
      1px solid
      var(--border-soft);
  }

  .heading-group {
    min-width: 0;
  }

  .eyebrow,
  .section-kicker,
  .account-label,
  .stat-label,
  .mobile-label {
    color: var(--text-muted);

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;

    text-transform: uppercase;
  }

  .eyebrow,
  .section-kicker {
    margin: 0 0 var(--space-1);
  }

  h1,
  h2,
  p {
    margin-top: 0;
  }

  h1 {
    margin-bottom: var(--space-1);

    color: var(--primary);

    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
  }

  .subtitle {
    margin: 0;

    color: var(--text-muted);
    font-size: 13px;
  }

  .account-area {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .account-copy {
    display: grid;
    gap: 2px;

    text-align: right;
  }

  .account-copy strong {
    max-width: 260px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 12px;
    font-weight: 600;
  }

  .signout-wrap :global(button) {
    min-height: 38px;
    padding: 0 var(--space-3);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .signout-wrap :global(button:hover) {
    background: var(--surface-hover);
  }

  .dashboard-section {
    margin-top: var(--space-8);
  }

  .section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);

    margin-bottom: var(--space-3);
  }

  .section-heading h2 {
    margin: 0;

    font-size: 17px;
    line-height: 1.3;
    font-weight: 600;
  }

  .section-note,
  .section-count {
    margin: 0;

    color: var(--text-muted);
    font-size: 11px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));

    gap: 10px;
  }

  .stat-card {
    min-width: 0;
    min-height: 118px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: var(--space-4);

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .stat-value {
    margin-top: var(--space-2);

    color: var(--text);

    font-size: 25px;
    line-height: 1;
    font-weight: 600;

    font-variant-numeric: tabular-nums;
  }

  .primary-value {
    color: var(--primary);
  }

  .success-value {
    color: var(--success);
  }

  .stat-caption {
    margin-top: var(--space-2);

    color: var(--text-muted);
    font-size: 11px;
  }

  .revision-panel {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      auto;
    align-items: center;
    gap: var(--space-6);

    padding: var(--space-4);

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .revision-summary {
    min-width: 0;
  }

  .revision-label {
    display: block;

    color: var(--text-muted);

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;

    text-transform: uppercase;
  }

  .revision-count {
    display: block;

    margin-top: var(--space-2);

    color: var(--primary);

    font-size: 30px;
    line-height: 1;
    font-weight: 600;

    font-variant-numeric:
      tabular-nums;
  }

  .revision-summary p {
    margin:
      var(--space-2)
      0
      0;

    color: var(--text-muted);

    font-size: 12px;
  }

  .revision-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .revision-primary,
  .revision-secondary {
    min-height: 38px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);

    padding:
      0
      var(--space-3);

    border-radius:
      var(--radius);

    font-size: 12px;
    font-weight: 700;

    text-decoration: none;
  }

  .revision-primary {
    background: var(--primary);
    color: var(--primary-text);

    border:
      1px solid
      var(--primary);
  }

  .revision-primary:hover {
    background:
      var(--primary-hover);
  }

  .revision-secondary {
    background:
      var(--surface);

    color:
      var(--text);

    border:
      1px solid
      var(--border);
  }

  .revision-secondary:hover {
    background:
      var(--surface-hover);
  }

  .revision-status {
    color: var(--success);

    font-size: 12px;
    font-weight: 600;
  }


  .test-list,
  .table-panel,
  .empty-state {
    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .test-list {
    overflow: hidden;
  }

  .test-list-head,
  .test-row {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      100px
      100px
      130px;

    align-items: center;
    gap: var(--space-4);
  }

  .test-list-head {
    padding: 9px var(--space-4);

    color: var(--text-muted);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;

    text-transform: uppercase;
  }

  .test-row {
    min-height: 62px;

    padding:
      10px
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);
  }

  .test-row:last-child {
    border-bottom: 0;
  }

  .test-title {
    min-width: 0;
  }

  .test-title strong {
    display: block;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-size: 13px;
    font-weight: 600;
  }

  .test-meta {
    color: var(--text-muted);

    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .test-meta strong {
    color: var(--text);
    font-weight: 500;
  }

  .mobile-label {
    display: none;
  }

  .start-test {
    min-height: 38px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);

    padding: 0 var(--space-3);

    background: var(--primary);
    color: var(--primary-text);

    border: 1px solid var(--primary);
    border-radius: var(--radius);

    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
  }

  .start-test:hover {
    background: var(--primary-hover);
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    color: var(--primary);

    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
  }

  .text-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .table-panel {
    overflow: hidden;
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;

    border-collapse: collapse;
  }

  th,
  td {
    padding:
      11px
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);

    text-align: left;
    white-space: nowrap;
  }

  th {
    color: var(--text-muted);

    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;

    text-transform: uppercase;
  }

  td {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: var(--surface-hover);
  }

  .attempt-title {
    min-width: 220px;

    color: var(--text);
    font-weight: 600;
  }

  .score-cell {
    color: var(--primary);
    font-weight: 700;
  }

  .correct-cell {
    color: var(--success);
  }

  .wrong-cell {
    color: var(--danger);
  }

  .skipped-cell {
    color: var(--warning);
  }

  .date-cell {
    color: var(--text-muted);
  }

  .empty-state {
    display: grid;
    gap: var(--space-1);

    padding: var(--space-6);
  }

  .empty-state strong {
    font-size: 13px;
  }

  .empty-state span {
    color: var(--text-muted);
    font-size: 12px;
  }


  @media (max-width: 760px) {
    .revision-panel {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .revision-actions {
      justify-content: flex-start;
    }

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

    .stat-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .test-list-head {
      display: none;
    }

    .test-row {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      align-items: start;

      padding: var(--space-4);
    }

    .test-title {
      grid-column: span 2;
    }

    .test-title strong {
      white-space: normal;
    }

    .test-meta {
      display: grid;
      gap: 2px;
    }

    .mobile-label {
      display: inline;
    }

    .start-test {
      grid-column: span 2;
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

    .stat-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      min-height: 96px;
    }

    .test-row {
      grid-template-columns: 1fr;
    }

    .test-title,
    .start-test {
      grid-column: auto;
    }

    .account-area {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>

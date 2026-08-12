<script>
  let {
    data,
    form
  } = $props();


  function formatDate(
    value
  ) {
    return new Date(
      value
    ).toLocaleString();
  }


  function confirmDeletion(
    event,
    test
  ) {
    const confirmed =
      window.confirm(
        `Delete “${test.title}” and all ${test.questionCount} questions? This cannot be undone.`
      );

    if (!confirmed) {
      event.preventDefault();
    }
  }
</script>


<svelte:head>
  <title>Test Management</title>
</svelte:head>


<main class="tests-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">Content administration</p>
      <h1>Question sets</h1>
      <p class="intro">
        Import, inspect and remove examination question banks.
      </p>
    </div>

    <div class="header-actions">
      <a class="secondary-link" href="/admin">
        ← Dashboard
      </a>

      <a class="primary-link" href="/question-import">
        Import question set
        <span aria-hidden="true">→</span>
      </a>
    </div>
  </header>

  {#if form?.deleteError}
    <section class="notice error-notice" role="alert">
      <strong>Question set not deleted</strong>
      <p>{form.deleteError}</p>
    </section>
  {/if}

  {#if form?.deleted}
    <section class="notice success-notice" aria-live="polite">
      <strong>Question set deleted</strong>
      <p>
        {form.deletedTitle} and its
        {form.deletedQuestionCount}
        questions were permanently removed.
      </p>
    </section>
  {/if}

  {#if data.tests.length === 0}
    <section class="empty-state">
      <strong>No question sets found</strong>
      <p>Import a JSON question bank to create the first set.</p>
    </section>
  {:else}
    <section class="set-list" aria-label="Question sets">
      <div class="list-heading" aria-hidden="true">
        <span>Question set</span>
        <span>Questions</span>
        <span>Attempts</span>
        <span>Duration</span>
        <span>Updated</span>
        <span>Actions</span>
      </div>

      {#each data.tests as test}
        <article class="set-row">
          <div class="set-name">
            <a href={`/admin/tests/${test.id}`}>
              {test.title}
            </a>
            <small>{test.id}</small>
          </div>

          <div class="metric" data-label="Questions">
            <strong>{test.questionCount}</strong>
          </div>

          <div class="metric" data-label="Attempts">
            <strong>{test.attemptCount}</strong>
          </div>

          <div class="metric" data-label="Duration">
            <strong>{test.durationMinutes}</strong>
            <small>min</small>
          </div>

          <time datetime={test.updatedAt}>
            {formatDate(test.updatedAt)}
          </time>

          <div class="row-actions">
            <a href={`/admin/tests/${test.id}`}>
              Open
            </a>

            <form
              method="POST"
              action="?/delete"
              onsubmit={(event) =>
                confirmDeletion(event, test)}
            >
              <input
                type="hidden"
                name="testId"
                value={test.id}
              />

              <button
                type="submit"
                class="delete-button"
                disabled={test.attemptCount > 0}
                title={test.attemptCount > 0
                  ? 'Sets with completed attempts are protected'
                  : `Delete ${test.title}`}
              >
                {test.attemptCount > 0
                  ? 'Protected'
                  : 'Delete'}
              </button>
            </form>
          </div>
        </article>
      {/each}
    </section>

    <p class="protection-note">
      Sets with recorded student attempts are protected so historical results
      cannot be removed accidentally.
    </p>
  {/if}
</main>


<style>
  .tests-page {
    width: min(1240px, calc(100% - 32px));
    margin-inline: auto;
    padding: var(--space-8) 0 80px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .eyebrow,
  h1,
  .intro,
  .notice p,
  .empty-state p,
  .protection-note {
    margin: 0;
  }

  .eyebrow,
  .list-heading,
  .set-name small,
  .metric small,
  time,
  .protection-note {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 10px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  h1 {
    margin-top: var(--space-2);
    color: var(--text);
    font-family: var(--font-heading);
    font-size: clamp(34px, 5vw, 58px);
    font-weight: 600;
    letter-spacing: -0.04em;
  }

  .intro {
    margin-top: var(--space-3);
    color: var(--text-muted);
  }

  .header-actions,
  .row-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .header-actions a,
  .row-actions a {
    color: var(--text);
    text-decoration: none;
  }

  .primary-link {
    min-width: 210px;
    display: flex;
    justify-content: space-between;
    gap: var(--space-5);
    padding: var(--space-3) var(--space-4);
    background: var(--primary);
    color: var(--primary-text) !important;
  }

  .notice {
    display: grid;
    gap: var(--space-1);
    margin-top: var(--space-5);
    padding: var(--space-4);
    border: 1px solid;
  }

  .notice p {
    color: var(--text-muted);
  }

  .error-notice {
    color: var(--danger);
    border-color: var(--danger);
  }

  .success-notice {
    color: var(--success);
    border-color: var(--success);
  }

  .set-list {
    margin-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .list-heading,
  .set-row {
    display: grid;
    grid-template-columns:
      minmax(250px, 2.2fr)
      minmax(80px, 0.6fr)
      minmax(80px, 0.6fr)
      minmax(90px, 0.7fr)
      minmax(150px, 1fr)
      minmax(160px, auto);
    align-items: center;
    gap: var(--space-4);
  }

  .list-heading {
    padding: var(--space-3) var(--space-2);
    border-bottom: 1px solid var(--border);
  }

  .set-row {
    min-height: 94px;
    padding: var(--space-4) var(--space-2);
    border-bottom: 1px solid var(--border-soft);
  }

  .set-row:hover {
    background: var(--surface-hover);
  }

  .set-name {
    min-width: 0;
    display: grid;
    gap: var(--space-1);
  }

  .set-name a {
    overflow: hidden;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .set-name small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .metric {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .metric strong {
    color: var(--text);
    font-family: var(--font-heading);
    font-size: 21px;
  }

  .row-actions {
    justify-content: flex-end;
  }

  .row-actions a,
  .delete-button {
    padding: 7px 10px;
    border: 1px solid var(--border);
    font-family: var(--font-ui);
    font-size: 12px;
  }

  .delete-button {
    background: transparent;
    color: var(--danger);
    cursor: pointer;
  }

  .delete-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--danger) 12%, transparent);
    border-color: var(--danger);
  }

  .delete-button:disabled {
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.65;
  }

  .protection-note {
    margin-top: var(--space-4);
    text-transform: none;
  }

  .empty-state {
    margin-top: var(--space-6);
    padding: var(--space-8);
    color: var(--text);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    text-align: center;
  }

  .empty-state p {
    margin-top: var(--space-2);
    color: var(--text-muted);
  }

  @media (max-width: 920px) {
    .list-heading {
      display: none;
    }

    .set-row {
      grid-template-columns: minmax(0, 1fr) repeat(3, auto);
    }

    .set-name {
      grid-column: 1 / -1;
    }

    time {
      grid-column: 1 / 2;
    }

    .row-actions {
      grid-column: 2 / -1;
    }

    .metric::before {
      content: attr(data-label) ': ';
      color: var(--text-muted);
      font-size: 10px;
    }
  }

  @media (max-width: 620px) {
    .page-header {
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .primary-link {
      min-width: 0;
    }

    .set-row {
      grid-template-columns: 1fr 1fr;
    }

    .metric,
    time,
    .row-actions {
      grid-column: auto;
    }

    time,
    .row-actions {
      grid-column: 1 / -1;
    }

    .row-actions {
      justify-content: flex-start;
    }
  }
</style>

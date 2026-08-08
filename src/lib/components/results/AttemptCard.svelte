<script>
  import {
    formatMilliseconds
  } from '$lib/utils/formatDuration.js';

  let {
    attempt
  } = $props();


  function formatDate(value) {
    return new Date(
      value
    ).toLocaleString();
  }
</script>


<article>
  <header>
    <h2>
      {attempt.testTitle}
    </h2>

    <p>
      Completed:
      {formatDate(
        attempt.completedAt
      )}
    </p>
  </header>

  <dl>
    <dt>Score</dt>

    <dd>
      {attempt.score.toFixed(2)}
      /
      {attempt.totalQuestions}
    </dd>

    <dt>Correct</dt>

    <dd>
      {attempt.correct}
    </dd>

    <dt>Wrong</dt>

    <dd>
      {attempt.wrong}
    </dd>

    <dt>Skipped</dt>

    <dd>
      {attempt.skipped}
    </dd>

    <dt>Time used</dt>

    <dd>
      {formatMilliseconds(
        attempt.durationMilliseconds
      )}
    </dd>
  </dl>

  <a href={`/results/${attempt.id}`}>
    View details
  </a>
</article>

<style>
  article {
    padding: var(--space-4);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);

    padding-bottom: var(--space-3);

    border-bottom: 1px solid var(--border-soft);
  }

  h2 {
    margin: 0;

    color: var(--text);

    font-size: 16px;
    line-height: 1.35;
    font-weight: 600;
  }

  header p {
    margin: 0;

    color: var(--text-muted);

    font-size: 11px;
    line-height: 1.4;
    text-align: right;
  }

  dl {
    display: grid;
    grid-template-columns:
      repeat(5, minmax(0, 1fr));

    gap: 0;

    margin: var(--space-4) 0;
  }

  dt,
  dd {
    margin: 0;
    padding-inline: var(--space-2);
  }

  dt {
    grid-row: 1;

    color: var(--text-muted);

    font-size: 11px;
    font-weight: 600;
  }

  dd {
    grid-row: 2;

    margin-top: 4px;

    color: var(--text);

    font-size: 16px;
    font-weight: 600;

    font-variant-numeric:
      tabular-nums;
  }

  dd:first-of-type {
    color: var(--primary);
  }

  a {
    min-height: 36px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding:
      0
      var(--space-3);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    font-size: 12px;
    font-weight: 600;

    text-decoration: none;
  }

  a:hover {
    background: var(--surface-hover);
    border-color: var(--primary);
  }

  @media (max-width: 650px) {
    header {
      flex-direction: column;
    }

    header p {
      text-align: left;
    }

    dl {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: var(--space-3);
    }

    dt,
    dd {
      grid-row: auto;
      padding: 0;
    }

    dt {
      align-self: end;
    }

    dd {
      margin-top: 0;
    }

    a {
      width: 100%;
    }
  }
</style>


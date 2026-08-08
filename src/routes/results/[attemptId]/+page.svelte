<script>
  import {
    formatMilliseconds
  } from '$lib/utils/formatDuration.js';

  import AttemptAnswer from '$lib/components/results/AttemptAnswer.svelte';

  let {
    data
  } = $props();

  const attempt =
    data.attempt;
</script>


<svelte:head>
  <title>
    Attempt Details
  </title>
</svelte:head>


<h1>
  {attempt.testTitle}
</h1>

<section aria-labelledby="attempt-summary-heading">
  <h2 id="attempt-summary-heading">
    Attempt summary
  </h2>

  <p>
    Score:
    {attempt.score.toFixed(2)}
    /
    {attempt.totalQuestions}
  </p>

  <p>
    Correct:
    {attempt.correct}
  </p>

  <p>
    Wrong:
    {attempt.wrong}
  </p>

  <p>
    Skipped:
    {attempt.skipped}
  </p>

  <p>
    Time used:
    {formatMilliseconds(
      attempt.durationMilliseconds
    )}
  </p>
</section>


<section aria-labelledby="answer-details-heading">
  <h2 id="answer-details-heading">
    Answer details
  </h2>

  {#each attempt.answers as answer
    (answer.questionId)}
    <AttemptAnswer
      {answer}
    />
  {/each}
</section>


<nav aria-label="Result navigation">
  <a href="/results">
    Back to result history
  </a>

  <a href="/">
    Return to test
  </a>
</nav>

<style>
  :global(body) {
    background: var(--bg);
    color: var(--text);
  }

  h1,
  section,
  nav {
    width: min(
      calc(100% - 32px),
      var(--page-width)
    );

    margin-inline: auto;
  }

  h1 {
    margin-top: var(--space-6);
    margin-bottom: var(--space-4);

    color: var(--primary);

    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
  }

  section {
    margin-bottom: var(--space-6);
  }

  section > h2 {
    margin: 0 0 var(--space-3);

    font-size: 16px;
    line-height: 1.3;
    font-weight: 600;
  }

  section[aria-labelledby="attempt-summary-heading"] {
    display: grid;
    grid-template-columns:
      repeat(5, minmax(0, 1fr));

    gap: 10px;
  }

  #attempt-summary-heading {
    grid-column: 1 / -1;
  }

  section[aria-labelledby="attempt-summary-heading"] > p {
    min-height: 82px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    margin: 0;
    padding: var(--space-3);

    background: var(--surface);
    color: var(--text-muted);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    font-size: 12px;
    line-height: 1.45;
  }

  section[aria-labelledby="attempt-summary-heading"] > p:first-of-type {
    color: var(--primary);
  }

  section[aria-labelledby="answer-details-heading"] {
    display: grid;
    gap: 10px;
  }

  #answer-details-heading {
    margin-bottom: 2px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);

    margin-bottom: var(--space-8);
  }

  nav a {
    min-height: 38px;

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

  nav a:hover {
    background: var(--surface-hover);
    border-color: var(--primary);
  }

  nav a:last-child {
    background: var(--primary);
    color: var(--primary-text);

    border-color: var(--primary);
  }

  nav a:last-child:hover {
    background: var(--primary-hover);
  }

  @media (max-width: 760px) {
    section[aria-labelledby="attempt-summary-heading"] {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    section[aria-labelledby="attempt-summary-heading"] > p:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 480px) {
    h1,
    section,
    nav {
      width: calc(100% - 20px);
    }

    h1 {
      margin-top: var(--space-4);

      font-size: 20px;
    }

    section[aria-labelledby="attempt-summary-heading"] {
      grid-template-columns: 1fr;
    }

    section[aria-labelledby="attempt-summary-heading"] > p:last-child {
      grid-column: auto;
    }

    nav {
      display: grid;
      grid-template-columns: 1fr;
    }
  }
</style>


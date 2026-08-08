<script>
  import {
    formatMilliseconds
  } from '$lib/utils/formatDuration.js';

  let {
    answer
  } = $props();


  function optionLetter(
    index
  ) {
    if (index === null) {
      return 'Skipped';
    }

    return String.fromCharCode(
      65 + index
    );
  }
</script>


<article>
  <h2>
    Question {answer.questionNumber}
    — {answer.status}
  </h2>

  <p>
    {answer.questionText}
  </p>

  <p>
    Selected answer:

    <strong>
      {optionLetter(
        answer.selectedAnswer
      )}
    </strong>
  </p>

  <p>
    Correct answer:

    <strong>
      {optionLetter(
        answer.correctAnswer
      )}
    </strong>
  </p>

  <p>
    Time:

    <strong>
      {formatMilliseconds(
        answer.timeMilliseconds
      )}
    </strong>
  </p>

  <p>
    Explanation:
    {answer.explanation}
  </p>
</article>

<style>
  article {
    padding: var(--space-4);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  h2 {
    margin:
      0
      0
      var(--space-3);

    padding-bottom:
      var(--space-3);

    color: var(--text);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size: 15px;
    line-height: 1.35;
    font-weight: 600;
  }

  p {
    margin:
      0
      0
      var(--space-3);

    color:
      var(--text-muted);

    font-size: 13px;
    line-height: 1.55;
  }

  p:first-of-type {
    margin-bottom:
      var(--space-4);

    color: var(--text);

    font-size: 15px;
    line-height: 1.6;
  }

  p:nth-of-type(2),
  p:nth-of-type(3),
  p:nth-of-type(4) {
    display: grid;
    grid-template-columns:
      minmax(110px, auto)
      minmax(0, 1fr);

    align-items: baseline;
    gap: var(--space-3);

    margin-bottom: 0;

    padding:
      9px
      0;

    border-top:
      1px solid
      var(--border-soft);
  }

  p:nth-of-type(2) strong {
    color: var(--primary);
  }

  p:nth-of-type(3) strong {
    color: var(--success);
  }

  p:nth-of-type(4) strong {
    color: var(--text);
  }

  strong {
    font-weight: 700;

    font-variant-numeric:
      tabular-nums;
  }

  p:last-of-type {
    margin:
      var(--space-4)
      0
      0;

    padding:
      var(--space-3);

    background:
      var(--surface-strong);

    color:
      var(--text-muted);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      var(--radius);
  }

  @media (max-width: 520px) {
    article {
      padding: var(--space-3);
    }

    p:nth-of-type(2),
    p:nth-of-type(3),
    p:nth-of-type(4) {
      grid-template-columns: 1fr;
      gap: 2px;
    }

    p:first-of-type {
      font-size: 14px;
    }
  }
</style>


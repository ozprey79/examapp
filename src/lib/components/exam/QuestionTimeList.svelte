<script>
  let {
    questions = [],
    getFormattedTime
  } = $props();
</script>

<details class="question-times">
  <summary>
    <span>
      Time per question
    </span>

    <span class="hint">
      View details
    </span>
  </summary>

  <ol>
    {#each questions as question, index
      (question.id)}
      <li>
        <span>
          Question {index + 1}
        </span>

        <strong>
          {getFormattedTime(
            question.id
          )}
        </strong>
      </li>
    {/each}
  </ol>
</details>

<style>
  .question-times {
    margin-top: 10px;

    background: var(--surface);

    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 11px 14px;

    cursor: pointer;

    font-size: 12px;
    font-weight: 600;

    font-family:
      var(--font-ui);

    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '›';

    margin-right: 8px;

    color: var(--text-muted);

    transform: rotate(0deg);

    transition:
      transform 120ms ease;
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  .hint {
    margin-left: auto;

    color: var(--text-muted);

    font-size: 11px;
    font-weight: 400;
  }

  ol {
    max-height: 260px;

    margin: 0;
    padding: 0;

    overflow-y: auto;

    border-top: 1px solid var(--border-soft);

    list-style: none;
  }

  li {
    display: flex;
    justify-content: space-between;
    gap: 20px;

    padding: 8px 14px;

    color: var(--text-muted);

    border-bottom:
      1px solid var(--border-soft);

    font-size: 12px;
  }

  li:last-child {
    border-bottom: 0;
  }

  li strong {
    color: var(--text);
    font-weight: 600;
  }
</style>

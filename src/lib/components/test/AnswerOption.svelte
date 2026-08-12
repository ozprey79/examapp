<script>
  let {
    letter,
    text,

    selected = false,
    correct = false,
    wrong = false,

    disabled = false,

    onclick = undefined
  } = $props();
</script>

<button
  type="button"
  class="option"
  class:selected
  class:correct
  class:wrong
  {disabled}
  {onclick}
>
  <span class="option-letter">
    {letter}
  </span>

  <span class="option-text">
    {text}
  </span>
</button>

<style>
  .option {
    width: 100%;

    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    align-items: center;

    min-height: 52px;

    padding: 7px 14px 7px 8px;

    background: var(--option-bg);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: var(--radius);

    text-align: left;

    font-family:
      var(--font-reading);

    transition:
      background 100ms ease,
      border-color 100ms ease;
  }

  .option:hover:not(:disabled) {
    background: var(--option-hover);
  }

  .option-letter {
    width: 30px;
    height: 30px;

    display: grid;
    place-items: center;

    background: var(--surface-strong);

    border: 1px solid var(--border);
    border-radius: 6px;

    font-weight: 700;
  }

  .option.selected {
    background: var(--option-selected-bg);
    border-color: var(--option-selected-border);
  }

  .option.selected .option-letter {
    background: var(--primary);
    color: var(--primary-text);

    border-color: var(--primary);
  }

  .option.correct {
    border-color: var(--success);
  }

  .option.correct .option-letter {
    background: var(--success);
    color: #111;

    border-color: var(--success);
  }

  .option.wrong {
    border-color: var(--danger);
  }

  .option.wrong .option-letter {
    background: var(--danger);
    color: #111;

    border-color: var(--danger);
  }

  .option:disabled {
    cursor: default;
  }
</style>

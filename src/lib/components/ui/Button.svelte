<script>
  let {
    children,
    variant = 'primary',
    type = 'button',
    disabled = false,
    onclick = undefined,
    class: className = ''
  } = $props();
</script>

<button
  {type}
  {disabled}
  {onclick}
  class="button {variant} {className}"
>
  {@render children()}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);

    min-height: 40px;
    padding: 0 var(--space-4);

    border: 1px solid transparent;
    border-radius: var(--radius-sm);

    font-size: var(--text-sm);
    font-weight: 650;
    letter-spacing: 0.025em;

    transition:
      background 120ms ease,
      border-color 120ms ease,
      color 120ms ease,
      transform 80ms ease;
  }

  .button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .button:disabled {
    opacity: 0.4;
  }

  .primary {
    background: var(--accent);
    color: #ffffff;

    clip-path: polygon(
      0 0,
      calc(100% - 8px) 0,
      100% 8px,
      100% 100%,
      0 100%
    );
  }

  .primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .secondary {
    background: var(--surface);
    color: var(--text);

    border-color: var(--border-strong);
  }

  .secondary:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  .ghost {
    background: transparent;
    color: var(--text-muted);
  }

  .ghost:hover:not(:disabled) {
    color: var(--text);
    background: var(--surface-subtle);
  }

  .danger {
    background: var(--danger);
    color: white;
  }
</style>
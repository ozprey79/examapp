<script>
  import { tick } from 'svelte';

  let {
    open = false,
    title,
    description,
    details = [],
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'default',
    onConfirm = undefined,
    onCancel = undefined
  } = $props();

  let dialogElement = $state();
  let cancelButton = $state();
  let confirmButton = $state();


  $effect(() => {
    if (!dialogElement) {
      return;
    }

    if (
      open &&
      !dialogElement.open
    ) {
      dialogElement.showModal();

      void tick().then(() => {
        if (tone === 'destructive') {
          cancelButton?.focus();
          return;
        }

        confirmButton?.focus();
      });

      return;
    }

    if (
      !open &&
      dialogElement.open
    ) {
      dialogElement.close();
    }
  });


  function handleCancel(event) {
    event.preventDefault();
    onCancel?.();
  }
</script>


<dialog
  bind:this={dialogElement}
  class:destructive={tone === 'destructive'}
  aria-labelledby="exam-confirmation-title"
  aria-describedby="exam-confirmation-description"
  oncancel={handleCancel}
>
  <div class="dialog-content">
    <p class="dialog-eyebrow">
      Confirmation required
    </p>

    <h2 id="exam-confirmation-title">
      {title}
    </h2>

    <p
      id="exam-confirmation-description"
      class="dialog-description"
    >
      {description}
    </p>

    {#if details.length > 0}
      <dl>
        {#each details as detail}
          <div>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}

    <div class="dialog-actions">
      <button
        bind:this={cancelButton}
        class="cancel-button"
        type="button"
        onclick={onCancel}
      >
        {cancelLabel}
      </button>

      <button
        bind:this={confirmButton}
        class="confirm-button"
        type="button"
        onclick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </div>
</dialog>


<style>
  dialog {
    width: min(
      calc(100% - 32px),
      460px
    );

    padding: 0;

    background: var(--surface-strong);
    color: var(--text);

    border: 1px solid var(--border);
    border-radius: 14px;

    box-shadow:
      0 24px 80px
      rgba(0, 0, 0, 0.52);
  }

  dialog::backdrop {
    background:
      rgba(4, 5, 5, 0.76);

    backdrop-filter:
      blur(4px);
  }

  .dialog-content {
    display: grid;
    gap: var(--space-4);

    padding: var(--space-6);
  }

  .dialog-eyebrow {
    margin: 0;

    color: var(--primary);

    font-family:
      var(--font-ui);

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;

    text-transform: uppercase;
  }

  h2 {
    margin: 0;

    font-size: 24px;
    line-height: 1.2;
  }

  .dialog-description {
    margin: 0;

    color: var(--text-muted);

    font-family:
      var(--font-reading);

    line-height: 1.55;
  }

  dl {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    margin: 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }

  dl div {
    display: grid;
    gap: 2px;

    padding:
      var(--space-3)
      var(--space-2);
  }

  dl div + div {
    border-left:
      1px solid
      var(--border-soft);
  }

  dt {
    color: var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size: 11px;
  }

  dd {
    margin: 0;

    font-family:
      var(--font-heading);

    font-size: 19px;
    font-weight: 600;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: var(--space-2);
  }

  button {
    min-height: 44px;

    padding:
      0 var(--space-4);

    border-radius:
      var(--radius);

    font-weight: 600;
  }

  .cancel-button {
    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);
  }

  .confirm-button {
    background: var(--primary);
    color: var(--primary-text);

    border: 1px solid var(--primary);
  }

  .destructive .confirm-button {
    background: var(--danger);
    color: #111;

    border-color: var(--danger);
  }

  button:hover {
    filter: brightness(1.08);
  }

  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .dialog-content {
      padding: var(--space-4);
    }

    .dialog-actions {
      grid-template-columns: 1fr;
    }

    .confirm-button {
      grid-row: 1;
    }
  }
</style>

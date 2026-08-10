<script>
  let {
    questionId
  } = $props();

  let saved =
    $state(false);

  let loading =
    $state(true);

  let changing =
    $state(false);

  let loadVersion = 0;


  $effect(() => {
    const id =
      questionId;

    if (!id) {
      saved = false;
      loading = false;
      return;
    }

    loadSavedState(id);
  });


  async function loadSavedState(
    id
  ) {
    const version =
      ++loadVersion;

    loading = true;

    try {
      const response =
        await fetch(
          `/api/questions/${encodeURIComponent(id)}/saved`
        );

      if (!response.ok) {
        throw new Error(
          'Could not load saved state'
        );
      }

      const data =
        await response.json();

      if (
        version ===
        loadVersion
      ) {
        saved =
          Boolean(
            data.saved
          );
      }
    } catch (error) {
      console.error(
        error
      );
    } finally {
      if (
        version ===
        loadVersion
      ) {
        loading = false;
      }
    }
  }


  async function toggleSaved() {
    if (
      !questionId ||
      changing
    ) {
      return;
    }

    changing = true;

    try {
      const response =
        await fetch(
          `/api/questions/${encodeURIComponent(questionId)}/saved`,
          {
            method:
              saved
                ? 'DELETE'
                : 'PUT'
          }
        );

      if (!response.ok) {
        throw new Error(
          'Could not update saved question'
        );
      }

      const data =
        await response.json();

      saved =
        Boolean(
          data.saved
        );
    } catch (error) {
      console.error(
        error
      );
    } finally {
      changing = false;
    }
  }
</script>


<button
  type="button"
  class="save-button"
  class:saved
  aria-pressed={saved}
  aria-label={
    saved
      ? 'Remove from saved questions'
      : 'Save question'
  }
  title={
    saved
      ? 'Saved'
      : 'Save for later'
  }
  disabled={
    loading ||
    changing
  }
  onclick={toggleSaved}
>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="
        M6 4
        C6 3.45 6.45 3 7 3
        H17
        C17.55 3 18 3.45 18 4
        V21
        L12 17
        L6 21
        Z
      "
      fill={
        saved
          ? 'currentColor'
          : 'none'
      }
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linejoin="round"
    />
  </svg>
</button>


<style>
  .save-button {
    display: inline-grid;
    place-items: center;

    width:
      var(--space-8);

    height:
      var(--space-8);

    padding: 0;

    color:
      var(--text-muted);

    background-color:
      transparent;

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);
  }

  .save-button:hover:not(:disabled) {
    color:
      var(--text);

    background-color:
      var(--surface-hover);
  }

  .save-button.saved {
    color:
      var(--primary);

    border-color:
      var(--primary);
  }

  .save-button:disabled {
    opacity: 0.6;
  }

  svg {
    width:
      var(--space-4);

    height:
      var(--space-4);
  }
</style>
<script>
  let { data } = $props();

  const dueCount =
    $derived(
      data.dueQuestions.length
    );
</script>

<h1>Revision</h1>

<section>
  <h2>Due Review</h2>

  <p>
    Questions scheduled for revision:
    <strong>{dueCount}</strong>
  </p>

  {#if dueCount > 0}
    <a href="/student/revision/due">
      Start Due Review
    </a>
  {:else}
    <p>
      Nothing is currently due.
    </p>
  {/if}
</section>

<hr />

<section>
  <h2>Revise Now</h2>

  <p>
    Practice whenever you want without waiting
    for the Leitner schedule.
  </p>

  <a href="/student/revision/practice">
    Revise Now
  </a>
</section>
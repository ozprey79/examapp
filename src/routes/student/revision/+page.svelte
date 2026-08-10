<script>
  import HalftoneAction
    from '$lib/components/test/ui/HalftoneAction.svelte';


  let { data } = $props();


  const dueCount =
    $derived(
      data.dueQuestions.length
    );
</script>


<div class="revision-page">

  <!-- =====================================================
       HEADER
  ====================================================== -->

  <header class="page-header">

    <div>
      <p class="eyebrow">
        Student / Revision
      </p>

      <h1>
        Revision
      </h1>
    </div>


    <a
      class="navigation-action"
      href="/student"
    >
      ← Dashboard
    </a>

  </header>



  <!-- =====================================================
       DUE COUNT
  ====================================================== -->

  <section class="revision-hero">

    <div class="due-number">
      <strong>
        {dueCount}
      </strong>

      <span>
        Questions due
      </span>
    </div>


    <p class="hero-copy">
      Questions currently scheduled
      by your Leitner revision cycle.
    </p>

  </section>



  <!-- =====================================================
       SCHEDULED REVIEW
  ====================================================== -->

  <section class="revision-section">

    <div class="section-heading">

      <div>
        <p class="section-kicker">
          Scheduled
        </p>

        <h2>
          Due Review
        </h2>
      </div>


      <span class="section-meta">
        {dueCount}
        {dueCount === 1
          ? ' question'
          : ' questions'}
      </span>

    </div>


    <div class="action-row">

      <div class="action-copy">

        <strong>
          Review what is due now
        </strong>

        <p>
          Follow the Leitner schedule
          and reinforce questions at
          their planned review time.
        </p>

      </div>


      {#if dueCount > 0}

        <HalftoneAction
          href="/student/revision/due"
          label="Start Due Review"
        />

      {:else}

        <span class="empty-state">
          Nothing due right now
        </span>

      {/if}

    </div>

  </section>



  <!-- =====================================================
       FREE PRACTICE
  ====================================================== -->

  <section class="revision-section">

    <div class="section-heading">

      <div>
        <p class="section-kicker">
          Unscheduled
        </p>

        <h2>
          Revise Now
        </h2>
      </div>

    </div>


    <div class="action-row">

      <div class="action-copy">

        <strong>
          Practice without waiting
        </strong>

        <p>
          Choose a Leitner box or
          practise everything you have
          already learned.
        </p>

      </div>


      <HalftoneAction
        href="/student/revision/practice"
        label="Open Practice"
      />

    </div>

  </section>

</div>


<style>
  .revision-page {
    width:
      min(
        calc(
          100% -
          var(--space-8)
        ),
        var(--page-width)
      );

    margin-inline:
      auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    display: grid;

    gap:
      var(--space-8);
      
 
  }


  /* -----------------------------------------------------
     Header
  ------------------------------------------------------ */

  .page-header {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-5);

    padding-bottom:
      var(--space-5);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  h1,
  h2,
  p {
    margin: 0;
  }


  h1 {
    color:
      var(--primary);
  }


  h2 {
    color:
      var(--text);
  }


  .eyebrow,
  .section-kicker {
    margin-bottom:
      var(--space-1);

    color:
      var(--text-muted);

    text-transform:
      uppercase;

    letter-spacing:
      0.06em;
  }


  .navigation-action {
    min-height:
      var(--control-height);

    display:
      inline-flex;

    align-items: center;

    padding:
      0
      var(--space-3);

    color:
      var(--text);

    border:
      1px solid
      var(--border);

    border-radius:
      var(--radius);

    text-decoration:
      none;
  }


  .navigation-action:hover {
    color:
      var(--primary);

    border-color:
      var(--primary);
  }



  /* -----------------------------------------------------
     Hero
  ------------------------------------------------------ */

  .revision-hero {
    display: flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding:
      var(--space-4)
      0
      var(--space-5);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .due-number {
    display: grid;

    gap:
      var(--space-1);
  }


  .due-number strong {
    color:
      var(--primary);

    font-size:
      var(--font-size-display);

    line-height: 1;

    font-variant-numeric:
      tabular-nums;
  }


  .due-number span {
    color:
      var(--text-muted);

    text-transform:
      uppercase;
  }


  .hero-copy {
    max-width:
      var(--measure);

    color:
      var(--text-muted);

    line-height: 1.6;

    text-align: right;
  }



  /* -----------------------------------------------------
     Sections
  ------------------------------------------------------ */

  .revision-section {
    display: grid;

    gap:
      var(--space-4);
  }


  .section-heading {
    display: flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .section-meta {
    color:
      var(--text-muted);
  }


  .action-row {
    min-height:
      var(--section-row-height);

    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding:
      var(--space-5)
      0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .action-copy {
    display: grid;

    gap:
      var(--space-2);
  }


  .action-copy strong {
    color:
      var(--text);
  }


  .action-copy p {
    max-width:
      var(--measure);

    color:
      var(--text-muted);

    line-height: 1.6;
  }


  .empty-state {
    color:
      var(--text-muted);
  }


  @media (
    max-width: 640px
  ) {

    .revision-page {
      width:
        calc(
          100% -
          var(--space-6)
        );
    }


    .page-header,
    .revision-hero,
    .action-row {
      align-items:
        stretch;

      flex-direction:
        column;
    }


    .hero-copy {
      text-align: left;
    }


    .navigation-action {
      align-self:
        flex-start;
    }

  }
</style>
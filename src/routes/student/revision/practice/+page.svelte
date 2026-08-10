<script>
  import HalftoneAction
    from '$lib/components/test/ui/HalftoneAction.svelte';


  let { data } = $props();


  const intervals = {
    1: '1 day',
    2: '3 days',
    3: '7 days',
    4: '14 days',
    5: '30 days'
  }


  const descriptions = {
    1: 'Weakest / recently missed',
    2: 'Early reinforcement',
    3: 'Developing retention',
    4: 'Strong retention',
    5: 'Long-term retention'
  };


  const boxes =
    $derived(
      [1, 2, 3, 4, 5].map(
        (box) => ({
          number: box,

          count:
            data.summary.boxes[
              box
            ] ?? 0,

          interval:
            intervals[box],

          description:
            descriptions[box]
        })
      )
    );
</script>


<div class="practice-page">

  <!-- =====================================================
       HEADER
  ====================================================== -->

  <header class="page-header">

    <div>
      <p class="eyebrow">
        Revision / Practice
      </p>

      <h1>
        Revise Now
      </h1>
    </div>


    <a
      class="navigation-action"
      href="/student/revision"
    >
      ← Revision
    </a>

  </header>



  <!-- =====================================================
       INTRO
  ====================================================== -->

  <section class="practice-intro">

    <div class="total-block">

      <strong>
        {data.summary.total}
      </strong>

      <span>
        Learned questions
      </span>

    </div>


    <p>
      Practice ignores the scheduled
      review date. Choose a box based on
      how strongly you want to reinforce
      the material.
    </p>

  </section>



  <!-- =====================================================
       LEITNER PROGRESSION
  ====================================================== -->

  <section class="leitner-section">

    <div class="section-heading">

      <div>
        <p class="section-kicker">
          Distribution
        </p>

        <h2>
          Leitner Progression
        </h2>
      </div>

    </div>


    <div class="progression">

      {#each boxes as box}

        <div class="progression-item">

          <span class="progression-label">
            Box {box.number}
          </span>


          <strong>
            {box.count}
          </strong>


          <div
            class="progression-node"
            aria-hidden="true"
          ></div>


          <span class="progression-interval">
            {box.interval}
          </span>

        </div>

      {/each}

    </div>

  </section>



  <!-- =====================================================
       BOX PRACTICE
  ====================================================== -->

  <section class="practice-section">

    <div class="section-heading">

      <div>
        <p class="section-kicker">
          Select
        </p>

        <h2>
          Practice by Box
        </h2>
      </div>

    </div>


    <div class="box-list">

      {#each boxes as box}

        <article class="box-row">

          <div class="box-index">
            0{box.number}
          </div>


          <div class="box-main">

            <div class="box-title">

              <h3>
                Box {box.number}
              </h3>

              <span>
                {box.count}
                {box.count === 1
                  ? ' question'
                  : ' questions'}
              </span>

            </div>


            <p>
              {box.description}
              ·
              {box.interval}
              interval
            </p>

          </div>


          <div class="box-action">

            {#if box.count > 0}

              <HalftoneAction
                href={`/student/revision/practice/box-${box.number}`}
                label="Practice"
                ariaLabel={`Practice Box ${box.number}`}
              />

            {:else}

              <span class="empty-state">
                Empty
              </span>

            {/if}

          </div>

        </article>

      {/each}

    </div>

  </section>



  <!-- =====================================================
       ALL QUESTIONS
  ====================================================== -->

  <section class="practice-all">

    <div>

      <p class="section-kicker">
        Full collection
      </p>

      <h2>
        All Learned Questions
      </h2>

      <p class="all-description">
        Practice every question currently
        stored in your Leitner system,
        regardless of box.
      </p>

    </div>


    <div class="all-action">

      <span>
        {data.summary.total}
        questions
      </span>


      {#if data.summary.total > 0}

        <HalftoneAction
          href="/student/revision/practice/all"
          label="Practice All"
        />

      {/if}

    </div>

  </section>



  <footer class="page-footer">

    <a
      class="navigation-action"
      href="/student"
    >
      ← Dashboard
    </a>


    <a
      class="navigation-action"
      href="/student/revision"
    >
      Revision
    </a>

  </footer>

</div>


<style>
  .practice-page {
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


  h1,
  h2,
  h3,
  p {
    margin: 0;
  }


  h1 {
    color:
      var(--primary);
  }


  h2,
  h3 {
    color:
      var(--text);
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


  .eyebrow,
  .section-kicker {
    margin-bottom:
      var(--space-1);

    color:
      var(--text-muted);

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .navigation-action {
    min-height:
      var(--control-height);

    display:
      inline-flex;

    align-items: center;

    justify-content: center;

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

    text-decoration: none;
  }


  .navigation-action:hover {
    color:
      var(--primary);

    border-color:
      var(--primary);
  }



  /* -----------------------------------------------------
     Intro
  ------------------------------------------------------ */

  .practice-intro {
    display: flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding-bottom:
      var(--space-5);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .practice-intro > p {
    max-width:
      var(--measure);

    color:
      var(--text-muted);

    line-height: 1.6;

    text-align: right;
  }


  .total-block {
    display: grid;

    gap:
      var(--space-1);
  }


  .total-block strong {
    color:
      var(--primary);

    font-size:
      var(--font-size-display);

    line-height: 1;

    font-variant-numeric:
      tabular-nums;
  }


  .total-block span {
    color:
      var(--text-muted);

    text-transform:
      uppercase;
  }



  /* -----------------------------------------------------
     Generic section
  ------------------------------------------------------ */

  .leitner-section,
  .practice-section {
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
  }



  /* -----------------------------------------------------
     Leitner visualization
  ------------------------------------------------------ */

  .progression {
    position: relative;

    display: grid;

    grid-template-columns:
      repeat(
        5,
        minmax(0, 1fr)
      );

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .progression::before {
    content: '';

    position: absolute;

    left: 10%;
    right: 10%;

    top: 64%;

    height: 1px;

    background:
      var(--border-soft);
  }


  .progression-item {
    position: relative;

    z-index: 1;

    display: grid;

    justify-items: center;

    gap:
      var(--space-2);

    padding:
      var(--space-4)
      var(--space-2);
  }


  .progression-label,
  .progression-interval {
    color:
      var(--text-muted);
  }


  .progression-item strong {
    color:
      var(--text);

    font-variant-numeric:
      tabular-nums;
  }


  .progression-node {
    width:
      var(--leitner-node-size);

    aspect-ratio: 1;

    background:
      var(--primary);

    border-radius:
      50%;

    border:
      1px solid
      var(--border);
  }



  /* -----------------------------------------------------
     Box rows
  ------------------------------------------------------ */

  .box-list {
    border-top:
      1px solid
      var(--border-soft);
  }


  .box-row {
    display: grid;

    grid-template-columns:
      auto
      minmax(0, 1fr)
      auto;

    align-items: center;

    gap:
      var(--space-5);

    padding:
      var(--space-4)
      0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .box-row:hover {
    background:
      var(--surface-hover);
  }


  .box-index {
    color:
      var(--text-muted);

    font-variant-numeric:
      tabular-nums;
  }


  .box-main {
    min-width: 0;

    display: grid;

    gap:
      var(--space-2);
  }


  .box-title {
    display: flex;

    align-items:
      baseline;

    gap:
      var(--space-3);
  }


  .box-title span {
    color:
      var(--text-muted);
  }


  .box-main p {
    color:
      var(--text-muted);

    line-height: 1.5;
  }


  .empty-state {
    color:
      var(--text-muted);
  }



  /* -----------------------------------------------------
     All questions
  ------------------------------------------------------ */

  .practice-all {
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


  .practice-all > div:first-child {
    display: grid;

    gap:
      var(--space-2);
  }


  .all-description {
    max-width:
      var(--measure);

    color:
      var(--text-muted);

    line-height: 1.6;
  }


  .all-action {
    display: flex;

    align-items: center;

    gap:
      var(--space-4);
  }


  .all-action > span {
    color:
      var(--text-muted);

    white-space: nowrap;
  }



  /* -----------------------------------------------------
     Footer
  ------------------------------------------------------ */

  .page-footer {
    display: flex;

    align-items: center;

    justify-content:
      space-between;

    gap:
      var(--space-4);

    padding-top:
      var(--space-4);

    border-top:
      1px solid
      var(--border-soft);
  }



  @media (
    max-width: 700px
  ) {

    .practice-page {
      width:
        calc(
          100% -
          var(--space-6)
        );
    }


    .page-header,
    .practice-intro,
    .practice-all {
      align-items:
        stretch;

      flex-direction:
        column;
    }


    .practice-intro > p {
      text-align: left;
    }


    .progression {
      grid-template-columns:
        repeat(
          5,
          minmax(
            var(--leitner-mobile-width),
            1fr
          )
        );

      overflow-x: auto;
    }


    .box-row {
      grid-template-columns:
        auto
        minmax(0, 1fr);
    }


    .box-action {
      grid-column:
        2;
    }


    .all-action {
      justify-content:
        space-between;
    }

  }
</style>
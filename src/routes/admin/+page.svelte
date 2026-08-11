<script>
  import {
    onMount
  } from 'svelte';

  import '@fontsource/space-mono/400.css';
  import '@fontsource/space-mono/700.css';

  import SignOutButton
    from '$lib/components/auth/SignOutButton.svelte';

  import AdminStudentActivityViz
    from '$lib/components/dashboard/AdminStudentActivityViz.svelte';


  let {
    data
  } = $props();


  let activeSection =
    $state(
      'overview'
    );
 let mounted =
    $state(false);


  

  let selectedStudentId =
    $state(null);


  onMount(() => {
    mounted =
      true;
  });



  const students =
    $derived(
      data.students ??
      []
    );


  const stats =
    $derived(
      data.stats ?? {
        studentCount:
          students.length,

        activeStudents:
          0,

        studentsWithoutAttempts:
          0,

        totalAttempts:
          0,

        latestActivity:
          null
      }
    );


  function formatScore(
    score
  ) {
    if (
      score === null ||
      score === undefined
    ) {
      return '—';
    }


    const value =
      Number(
        score
      );


    if (
      !Number.isFinite(
        value
      )
    ) {
      return '—';
    }


    return value
      .toFixed(
        2
      )
      .replace(
        /\.00$/,
        ''
      );
  }


  function formatDate(
    value
  ) {
    if (!value) {
      return 'No attempts yet';
    }


    return new Date(
      value
    ).toLocaleString(
      'en-IN',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short'
      }
    );
  }


  function selectStudent(
    userId
  ) {
    selectedStudentId =
      userId;

    activeSection =
      'students';


    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            document
              .getElementById(
                `student-row-${userId}`
              )
              ?.scrollIntoView({
                behavior:
                  'smooth',

                block:
                  'center'
              });
          }
        );
      }
    );
  }
</script>


<svelte:head>
  <title>
    Admin Dashboard
  </title>
</svelte:head>


<div class="admin-dashboard">

  <!-- ======================================================
       HEADER
  ======================================================= -->

  <header class="dashboard-header">

    <div class="heading-group">

      <p class="eyebrow">
        Admin / Overview
      </p>

      <h1>
        Examination Control
      </h1>

    </div>


    <div class="header-right">

      <div class="admin-account">

        <strong>
          {data.profile?.displayName ??
            data.user?.name ??
            'Administrator'}
        </strong>

        <span>
          {data.user?.email ?? ''}
        </span>

      </div>


      <SignOutButton />

    </div>

  </header>


  <!-- ======================================================
       ADMIN ACTIONS
  ======================================================= -->

  <nav
    class="admin-actions"
    aria-label="Admin actions"
  >

    <a href="/admin/tests">
      Manage Tests →
    </a>

    <a href="/question-import">
      Import Questions →
    </a>

  </nav>


  <!-- ======================================================
       DATA VISUALIZATION
  ======================================================= -->

  <section class="dashboard-viz">

    <AdminStudentActivityViz
      {students}

      selectedUserId={
        selectedStudentId
      }

      onSelect={
        selectStudent
      }
    />

  </section>


  <!-- ======================================================
       RAIL
  ======================================================= -->

  <section class="dashboard-switcher">

    <div
      class="section-rail"

      role="tablist"

      aria-label="Admin dashboard sections"
    >

      <button
        type="button"

        role="tab"

        class:active={
          activeSection ===
          'overview'
        }

        aria-selected={
          activeSection ===
          'overview'
        }

        onclick={() => {
          activeSection =
            'overview';
        }}
      >
        Overview
      </button>


      <button
        type="button"

        role="tab"

        class:active={
          activeSection ===
          'students'
        }

        aria-selected={
          activeSection ===
          'students'
        }

        onclick={() => {
          activeSection =
            'students';
        }}
      >

        <span>
          Students
        </span>

        <span class="tab-count">
          {stats.studentCount}
        </span>

      </button>

    </div>


    <div class="section-panel">

      <!-- ==================================================
           OVERVIEW
      =================================================== -->

      {#if
        activeSection ===
        'overview'
      }

        <section
          class="panel-block"

          role="tabpanel"

          aria-label="Admin overview"
        >

          <header class="panel-heading">

            <div>

              <p class="panel-eyebrow">
                System
              </p>

              <h2>
                Overview
              </h2>

            </div>

          </header>


          <div class="metric-strip">

            <article>

              <span>
                Students
              </span>

              <strong>
                {stats.studentCount}
              </strong>

            </article>


            <article>

              <span>
                Active students
              </span>

              <strong>
                {stats.activeStudents}
              </strong>

            </article>


            <article>

              <span>
                Total attempts
              </span>

              <strong>
                {stats.totalAttempts}
              </strong>

            </article>


            <article>

              <span>
                No attempts
              </span>

              <strong>
                {stats.studentsWithoutAttempts}
              </strong>

            </article>

          </div>


          <div class="overview-details">

            <div>

              <span>
                Latest student activity
              </span>

              <strong>
                {formatDate(
                  stats.latestActivity
                )}
              </strong>

            </div>


            <div class="overview-links">

              <a href="/admin/tests">
                Test management →
              </a>

              <a href="/question-import">
                Question import →
              </a>

            </div>

          </div>

        </section>


      <!-- ==================================================
           STUDENTS
      =================================================== -->

      {:else}

        <section
          class="panel-block"

          role="tabpanel"

          aria-label="Student accounts"
        >

          <header class="panel-heading">

            <div>

              <p class="panel-eyebrow">
                User management
              </p>

              <h2>
                Students
              </h2>

            </div>


            <span class="section-note">
              {stats.studentCount}
              accounts
            </span>

          </header>


          {#if
            students.length ===
            0
          }

            <div class="empty-state">

              <strong>
                No student accounts found.
              </strong>

            </div>

          {:else}

            <div class="student-table-wrap">

              <div class="student-table">

                <div
                  class="student-table-head"

                  aria-hidden="true"
                >

                  <span>
                    Student
                  </span>

                  <span>
                    Email
                  </span>

                  <span>
                    Attempts
                  </span>

                  <span>
                    Latest
                  </span>

                  <span>
                    Best
                  </span>

                  <span>
                    Average
                  </span>

                  <span>
                    Last activity
                  </span>

                  <span></span>

                </div>


                {#each
                  students as student
                  (student.userId)
                }

                  <article
                    id={`student-row-${student.userId}`}

                    class="student-row"

                    class:selected={
                      selectedStudentId ===
                      student.userId
                    }

                    onclick={() => {
                      selectedStudentId =
                        student.userId;
                    }}
                  >

                    <div class="student-name">

                      <strong>
                        {student.name}
                      </strong>

                      <span>
                        Student
                      </span>

                    </div>


                    <span class="student-email">
                      {student.email}
                    </span>


                    <strong class="numeric">
                      {student.attemptCount}
                    </strong>


                    <span class="numeric">
                      {formatScore(
                        student.latestScore
                      )}
                    </span>


                    <span class="numeric">
                      {formatScore(
                        student.bestScore
                      )}
                    </span>


                    <span class="numeric">
                      {formatScore(
                        student.averageScore
                      )}
                    </span>


                    <span class="student-date">
                      {formatDate(
                        student.lastAttemptAt
                      )}
                    </span>


                    <a
                      class="open-student"

                      href={`/admin/students/${student.userId}`}

                      onclick={(
                        event
                      ) => {
                        event.stopPropagation();
                      }}
                    >
                      Open →
                    </a>

                  </article>

                {/each}

              </div>

            </div>

          {/if}

        </section>

      {/if}

    </div>

  </section>

</div>


<style>
  .admin-dashboard {
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

    color:
      var(--text);

    font-family:
      'Space Mono',
      monospace;
  }


  /* ========================================================
     Header
  ======================================================== */

  .dashboard-header {
    display:
      flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding-bottom:
      var(--space-4);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .eyebrow,
  .panel-eyebrow {
    margin:
      0 0
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  h1,
  h2,
  p {
    margin:
      0;
  }


  h1 {
    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        1.9
      );

    line-height:
      1.15;
  }


  h2 {
    font-size:
      calc(
        var(--font-size-base) *
        1.15
      );
  }


  .header-right {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-3);
  }


  .admin-account {
    display:
      grid;

    gap:
      var(--space-1);

    text-align:
      right;
  }


  .admin-account span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  .header-right :global(button) {
    min-height:
      var(--space-8);

    padding:
      0 var(--space-3);

    background-color:
      transparent;

    color:
      var(--text-muted);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      var(--radius);
  }


  .header-right :global(button:hover) {
    color:
      var(--text);

    background-color:
      var(--surface-hover);

    border-color:
      var(--border);
  }


  /* ========================================================
     Admin quick actions
  ======================================================== */

  .admin-actions {
    display:
      flex;

    flex-wrap:
      wrap;

    gap:
      var(--space-4);

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .admin-actions a,
  .overview-links a {
    color:
      var(--text-muted);

    text-decoration:
      none;
  }


  .admin-actions a:hover,
  .overview-links a:hover {
    color:
      var(--primary);
  }


  /* ========================================================
     Visualization
  ======================================================== */

  .dashboard-viz {
    margin-top:
      var(--space-8);
  }


  /* ========================================================
     Rail
  ======================================================== */

  .dashboard-switcher {
    display:
      grid;

    gap:
      var(--space-4);

    margin-top:
      var(--space-8);
  }


  .section-rail {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-6);

    overflow-x:
      auto;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .section-rail button {
    flex:
      0 0 auto;

    display:
      inline-flex;

    align-items:
      center;

    gap:
      var(--space-2);

    padding:
      var(--space-3) 0;

    background-color:
      transparent;

    color:
      var(--text-muted);

    border:
      0;

    border-bottom:
      1px solid
      transparent;

    font-size:
      calc(
        var(--font-size-base) *
        0.86
      );

    font-weight:
      600;

    letter-spacing:
      0.08em;

    text-transform:
      uppercase;
  }


  .section-rail button:hover,
  .section-rail button.active {
    color:
      var(--primary);
  }


  .section-rail button.active {
    border-bottom-color:
      var(--primary);
  }


  .tab-count {
    min-width:
      var(--space-6);

    display:
      inline-flex;

    align-items:
      center;

    justify-content:
      center;

    padding:
      0 var(--space-2);

    background-color:
      var(--surface-strong);

    color:
      var(--text);

    border:
      1px solid
      var(--border-soft);

    border-radius:
      var(--radius);

    font-variant-numeric:
      tabular-nums;
  }


  /* ========================================================
     Panels
  ======================================================== */

  .panel-block {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .panel-heading {
    display:
      flex;

    align-items:
      flex-end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .section-note {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  /* ========================================================
     Overview
  ======================================================== */

  .metric-strip {
    display:
      grid;

    grid-template-columns:
      repeat(
        4,
        minmax(
          0,
          1fr
        )
      );

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .metric-strip article {
    min-width:
      0;

    display:
      flex;

    align-items:
      baseline;

    justify-content:
      space-between;

    gap:
      var(--space-3);

    padding:
      var(--space-4);

    border-right:
      1px solid
      var(--border-soft);
  }


  .metric-strip article:last-child {
    border-right:
      0;
  }


  .metric-strip span,
  .overview-details span {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.76
      );

    text-transform:
      uppercase;

    letter-spacing:
      0.05em;
  }


  .metric-strip strong {
    font-size:
      calc(
        var(--font-size-base) *
        1.35
      );

    font-variant-numeric:
      tabular-nums;
  }


  .overview-details {
    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .overview-details > div:first-child {
    display:
      grid;

    gap:
      var(--space-1);
  }


  .overview-links {
    display:
      flex;

    flex-wrap:
      wrap;

    justify-content:
      flex-end;

    gap:
      var(--space-4);
  }


  /* ========================================================
     Student table
  ======================================================== */

  .student-table-wrap {
    overflow-x:
      auto;
  }


  .student-table {
    min-width:
      1060px;

    border-top:
      1px solid
      var(--border-soft);
  }


  .student-table-head,
  .student-row {
    display:
      grid;

    grid-template-columns:
      minmax(
        150px,
        1.1fr
      )
      minmax(
        210px,
        1.5fr
      )
      76px
      76px
      76px
      84px
      minmax(
        160px,
        1fr
      )
      auto;

    align-items:
      center;

    gap:
      var(--space-3);
  }


  .student-table-head {
    padding:
      var(--space-2) 0;

    color:
      var(--text-muted);

    border-bottom:
      1px solid
      var(--border-soft);

    font-size:
      calc(
        var(--font-size-base) *
        0.7
      );

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .student-row {
    min-height:
      68px;

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);

    cursor:
      pointer;
  }


  .student-row:hover,
  .student-row.selected {
    background-color:
      var(--surface-hover);
  }


  .student-row.selected {
    box-shadow:
      inset
      3px
      0
      0
      var(--primary);
  }


  .student-name {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .student-name strong,
  .student-email {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;
  }


  .student-name span,
  .student-email,
  .student-date {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  .numeric {
    font-variant-numeric:
      tabular-nums;
  }


  .open-student {
    justify-self:
      end;

    color:
      var(--primary);

    font-weight:
      600;

    text-decoration:
      none;
  }


  .open-student:hover {
    text-decoration:
      underline;
  }


  .empty-state {
    min-height:
      160px;

    display:
      grid;

    place-items:
      center;

    color:
      var(--text-muted);

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  /* ========================================================
     Responsive
  ======================================================== */

  @media (
    max-width: 800px
  ) {

    .metric-strip {
      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );
    }


    .metric-strip article:nth-child(2) {
      border-right:
        0;
    }


    .metric-strip article:nth-child(-n + 2) {
      border-bottom:
        1px solid
        var(--border-soft);
    }

  }


  @media (
    max-width: 700px
  ) {

    .dashboard-header,
    .panel-heading,
    .overview-details {
      align-items:
        flex-start;

      flex-direction:
        column;
    }


    .header-right {
      width:
        100%;

      justify-content:
        space-between;
    }


    .admin-account {
      text-align:
        left;
    }


    .overview-links {
      justify-content:
        flex-start;
    }

  }


  @media (
    max-width: 480px
  ) {

    .admin-dashboard {
      width:
        calc(
          100% -
          var(--space-4)
        );

      padding-top:
        var(--space-4);
    }


    .metric-strip {
      grid-template-columns:
        1fr;
    }


    .metric-strip article {
      border-right:
        0;

      border-bottom:
        1px solid
        var(--border-soft);
    }


    .metric-strip article:last-child {
      border-bottom:
        0;
    }

  }
</style>

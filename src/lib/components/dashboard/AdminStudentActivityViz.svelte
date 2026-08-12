<script>
  let {
    students = [],
    selectedUserId = null,
    onSelect = () => {}
  } = $props();


  const VISIBLE_STUDENTS =
    18;

  const WIDTH =
    920;

  const HEIGHT =
    210;

  const SLOT_WIDTH =
    WIDTH /
    VISIBLE_STUDENTS;

  const BAR_WIDTH =
    12;

  const MIN_HEIGHT =
    12;

  const MAX_HEIGHT =
    118;

  const BASELINE =
    158;


  const visibleStudents =
    $derived(
      students.slice(
        0,
        VISIBLE_STUDENTS
      )
    );


  const maxAttempts =
    $derived.by(() => {
      const values =
        visibleStudents.map(
          (student) =>
            Number(
              student.attemptCount ??
              0
            )
        );


      return Math.max(
        1,
        ...values
      );
    });


  const selectedStudent =
    $derived(
      students.find(
        (student) =>
          student.userId ===
          selectedUserId
      ) ??
      null
    );


  function barHeight(
    student
  ) {
    const attempts =
      Math.max(
        0,
        Number(
          student.attemptCount ??
          0
        )
      );


    if (attempts === 0) {
      return MIN_HEIGHT;
    }


    return (
      MIN_HEIGHT +
      (
        attempts /
        maxAttempts
      ) *
      (
        MAX_HEIGHT -
        MIN_HEIGHT
      )
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
    ).toLocaleDateString(
      'en-IN'
    );
  }
</script>


<section class="student-activity-viz">

  <header class="viz-header">

    <div>

      <p class="viz-eyebrow">
        Cohort activity
      </p>

      <h2>
        Student attempt distribution
      </h2>

    </div>


    <div class="viz-total">

      <strong>
        {students.length}
      </strong>

      <span>
        students
      </span>

    </div>

  </header>


  {#if students.length === 0}

    <div class="viz-empty">
      No student accounts found.
    </div>

  {:else}

    <div class="chart-wrap">

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}

        role="img"

        aria-label="Student activity. Bar height represents number of attempts."
      >

        <defs>

          <linearGradient
            id="admin-student-gradient"

            x1="0%"
            y1="100%"

            x2="0%"
            y2="0%"
          >

            <stop
              offset="0%"
              stop-color="var(--viz-spectrum-1)"
            />

            <stop
              offset="25%"
              stop-color="var(--viz-spectrum-2)"
            />

            <stop
              offset="50%"
              stop-color="var(--viz-spectrum-3)"
            />

            <stop
              offset="75%"
              stop-color="var(--viz-spectrum-4)"
            />

            <stop
              offset="100%"
              stop-color="var(--viz-spectrum-5)"
            />

          </linearGradient>

        </defs>


        <line
          class="baseline"

          x1="0"
          x2={WIDTH}

          y1={BASELINE}
          y2={BASELINE}
        />


        {#each visibleStudents as student, index (student.userId)}

          {@const height =
            barHeight(
              student
            )}


          {@const x =
            index *
              SLOT_WIDTH +
            (
              SLOT_WIDTH -
              BAR_WIDTH
            ) /
            2}


          {@const y =
            BASELINE -
            height}


          <g
            class:selected={
              selectedUserId ===
              student.userId
            }
          >

            <rect
              class="hit-area"

              x={
                index *
                SLOT_WIDTH
              }

              y="0"

              width={
                SLOT_WIDTH
              }

              height={
                HEIGHT
              }

              onclick={() => {
                onSelect(
                  student.userId
                );
              }}
            />


            {#if
              Number(
                student.attemptCount ??
                0
              ) === 0
            }

              <circle
                class="student-zero"

                cx={
                  x +
                  BAR_WIDTH / 2
                }

                cy={
                  BASELINE -
                  MIN_HEIGHT / 2
                }

                r={
                  BAR_WIDTH / 2
                }
              >

                <title>
                  {student.name}
                  · 0 attempts
                </title>

              </circle>

            {:else}

              <rect
                class="student-bar"

                {x}
                {y}

                width={
                  BAR_WIDTH
                }

                {height}

                rx={
                  BAR_WIDTH / 2
                }
              >

                <title>
                  {student.name}
                  · {student.attemptCount}
                  attempts
                </title>

              </rect>

            {/if}


            {#if
              selectedUserId ===
              student.userId
            }

              <circle
                class="selected-marker"

                cx={
                  x +
                  BAR_WIDTH / 2
                }

                cy={
                  BASELINE +
                  18
                }

                r="3"
              />

            {/if}

          </g>

        {/each}

      </svg>

    </div>


    <div class="viz-inspector">

      {#if selectedStudent}

        <div class="selected-copy">

          <span>
            Selected student
          </span>

          <strong>
            {selectedStudent.name}
          </strong>

          <small>
            {selectedStudent.email}
          </small>

        </div>


        <div class="selected-facts">

          <span>
            <strong>
              {selectedStudent.attemptCount}
            </strong>
            attempts
          </span>

          <span>
            Last activity
            <strong>
              {formatDate(
                selectedStudent.lastAttemptAt
              )}
            </strong>
          </span>

        </div>

      {:else}

        <span class="viz-hint">
          Select a bar to locate that student in the table.
        </span>

      {/if}

    </div>

  {/if}

</section>


<style>
  .student-activity-viz {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .viz-header {
    display:
      flex;

    align-items:
      end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .viz-eyebrow {
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


  .viz-header h2 {
    margin:
      0;

    font-size:
      calc(
        var(--font-size-base) *
        1.15
      );
  }


  .viz-total {
    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-2);

    color:
      var(--text-muted);
  }


  .viz-total strong {
    color:
      var(--primary);

    font-variant-numeric:
      tabular-nums;
  }


  .chart-wrap {
    overflow-x:
      auto;

    background:
      transparent;

    border:
      0;

    border-radius:
      0;
  }


  svg {
    display:
      block;

    width:
      100%;

    min-width:
      680px;

    height:
      250px;
  }


  .baseline {
    stroke:
      var(--border-soft);

    stroke-width:
      1;
  }


  .hit-area {
    fill:
      transparent;

    cursor:
      pointer;
  }


  .student-bar {
    fill:
      url(
        #admin-student-gradient
      );

    opacity:
      0.7;

    pointer-events:
      none;
  }


  .student-zero {
    fill:
      var(--border-soft);

    opacity:
      0.65;

    pointer-events:
      none;
  }


  g.selected
  .student-bar {
    opacity:
      1;
  }


  g.selected
  .student-zero {
    fill:
      var(--primary);

    opacity:
      1;
  }


  .selected-marker {
    fill:
      var(--primary);

    pointer-events:
      none;
  }


  .viz-inspector {
    min-height:
      54px;

    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-6);

    padding-bottom:
      var(--space-3);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .selected-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .selected-copy span,
  .selected-copy small,
  .viz-hint {
    color:
      var(--text-muted);
  }


  .selected-copy strong,
  .selected-copy small {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;
  }


  .selected-facts {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-6);

    color:
      var(--text-muted);
  }


  .selected-facts span {
    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-2);
  }


  .selected-facts strong {
    color:
      var(--text);

    font-variant-numeric:
      tabular-nums;
  }


  .viz-empty {
    min-height:
      220px;

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


  @media (
    max-width: 700px
  ) {

    .viz-header,
    .viz-inspector,
    .selected-facts {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

  }
</style>

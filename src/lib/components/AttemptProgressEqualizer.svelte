<script>
  let {
    attempts = [],
    totalAttempts = 0
  } = $props();


  const VISIBLE_SLOTS = 18;

  const BAR_WIDTH = 10;
  const SLOT_WIDTH = 24;

  const MIN_HEIGHT =
    BAR_WIDTH;

  const MAX_HEIGHT = 112;

  const CHART_HEIGHT = 138;


  const DURATION = 0.8;
  const STAGGER = 0.045;


  let selectedIndex =
    $state(null);


  const visibleAttempts =
    $derived(
      attempts.slice(
        -VISIBLE_SLOTS
      )
    );


  const firstAttemptNumber =
    $derived(
      Math.max(
        1,
        totalAttempts -
          visibleAttempts.length +
          1
      )
    );


  const displayedSlots =
    $derived.by(() =>
      Array.from(
        {
          length:
            VISIBLE_SLOTS
        },

        (_, index) => {
          const attempt =
            visibleAttempts[index];

          if (attempt) {
            return {
              ...attempt,

              occupied:
                true,

              attemptNumber:
                firstAttemptNumber +
                index
            };
          }

          return {
            occupied:
              false,

            score:
              0,

            attemptNumber:
              null,

            id:
              null,

            testTitle:
              null
          };
        }
      )
    );


  const bestScore =
    $derived(
      attempts.length
        ? Math.max(
            ...attempts.map(
              (attempt) =>
                clampScore(
                  attempt.score
                )
            )
          )
        : 0
    );


  const selectedAttempt =
    $derived(
      selectedIndex === null
        ? null
        : displayedSlots[
            selectedIndex
          ] ?? null
    );


  $effect(() => {
    if (
      selectedIndex === null &&
      visibleAttempts.length > 0
    ) {
      selectedIndex =
        visibleAttempts.length - 1;
    }
  });


  function clampScore(
    score
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        Number(score) || 0
      )
    );
  }


  function getHeight(
    score
  ) {
    return (
      MIN_HEIGHT +
      (
        clampScore(score) /
        100
      ) *
      (
        MAX_HEIGHT -
        MIN_HEIGHT
      )
    );
  }


  function getY(
    height
  ) {
    return (
      CHART_HEIGHT -
      height
    ) / 2;
  }


  function getOvershootHeight(
    targetHeight
  ) {
    const extra =
      Math.min(
        6,
        (
          targetHeight -
          MIN_HEIGHT
        ) * 0.1
      );

    return Math.min(
      MAX_HEIGHT,
      targetHeight +
        extra
    );
  }


  function formatScore(
    score
  ) {
    const value =
      Number(score);

    if (
      !Number.isFinite(
        value
      )
    ) {
      return '0';
    }

    return Number.isInteger(
      value
    )
      ? String(value)
      : value.toFixed(1);
  }
</script>


<div class="progress-visual">

  <div class="chart-wrap">

    <svg
      class="progress-equalizer"
      viewBox={`0 0 ${
        VISIBLE_SLOTS *
        SLOT_WIDTH
      } ${CHART_HEIGHT}`}
      role="img"
      aria-label="Score progress across recent attempts"
    >

      {#each
        displayedSlots
        as slot, index
      }

        {@const score =
          clampScore(
            slot.score
          )}

        {@const targetHeight =
          getHeight(score)}

        {@const startY =
          getY(
            MIN_HEIGHT
          )}

        {@const targetY =
          getY(
            targetHeight
          )}

        {@const overshootHeight =
          getOvershootHeight(
            targetHeight
          )}

        {@const overshootY =
          getY(
            overshootHeight
          )}

        {@const x =
          index *
            SLOT_WIDTH +
          (
            SLOT_WIDTH -
            BAR_WIDTH
          ) / 2}

        {@const delay =
          index *
          STAGGER}


        <g
          class:occupied={
            slot.occupied
          }

          class:empty={
            !slot.occupied
          }

          class:selected={
            selectedIndex ===
            index
          }
        >

          {#if slot.occupied}

            <rect
              class="attempt-hit-area"
              x={
                index *
                SLOT_WIDTH
              }
              y="0"
              width={
                SLOT_WIDTH
              }
              height={
                CHART_HEIGHT
              }

              onclick={() => {
                selectedIndex =
                  index;
              }}

              onmouseenter={() => {
                selectedIndex =
                  index;
              }}
            />

          {/if}


          <rect
            class="attempt-shape"

            {x}

            y={
              slot.occupied
                ? startY
                : targetY
            }

            width={
              BAR_WIDTH
            }

            height={
              slot.occupied
                ? MIN_HEIGHT
                : targetHeight
            }

            rx={
              BAR_WIDTH / 2
            }
          >

            {#if slot.occupied}

              <animate
                attributeName="height"

                values={`${MIN_HEIGHT};${overshootHeight};${targetHeight}`}

                keyTimes="0;0.78;1"

                dur={`${DURATION}s`}

                begin={`${delay}s`}

                fill="freeze"
              />


              <animate
                attributeName="y"

                values={`${startY};${overshootY};${targetY}`}

                keyTimes="0;0.78;1"

                dur={`${DURATION}s`}

                begin={`${delay}s`}

                fill="freeze"
              />

            {/if}

          </rect>


          {#if
            slot.occupied &&
            index ===
              visibleAttempts.length -
                1
          }

            <circle
              class="latest-marker"

              cx={
                x +
                BAR_WIDTH / 2
              }

              cy={
                CHART_HEIGHT -
                4
              }

              r="2.5"
            />

          {/if}

        </g>

      {/each}

    </svg>

  </div>


  {#if
    selectedAttempt?.occupied
  }

    <div class="selected-attempt">

      <div>
        <span class="attempt-label">
          Attempt
          {selectedAttempt
            .attemptNumber}
        </span>

        <strong>
          {selectedAttempt
            .testTitle}
        </strong>
      </div>


      <div class="selected-score">
        <strong>
          {formatScore(
            selectedAttempt.score
          )}
        </strong>

        <span>
          score
        </span>
      </div>


      {#if selectedAttempt.id}

        <a
          href={`/student/results/${selectedAttempt.id}`}
        >
          Result
          <span aria-hidden="true">
            →
          </span>
        </a>

      {/if}

    </div>

  {/if}


  <div class="progress-metrics">

    <div>
      <span>
        Attempts
      </span>

      <strong>
        {totalAttempts}
      </strong>
    </div>


    <div>
      <span>
        Best score
      </span>

      <strong>
        {attempts.length
          ? formatScore(
              bestScore
            )
          : '—'}
      </strong>
    </div>


    <div>
      <span>
        Latest
      </span>

      <strong>
        {attempts.length
          ? formatScore(
              attempts[
                attempts.length -
                  1
              ].score
            )
          : '—'}
      </strong>
    </div>

  </div>

</div>


<style>
  .progress-visual {
    width: 100%;

    display: grid;

    gap:
      var(--space-4);
  }


  .chart-wrap {
    width: 100%;

    overflow-x: auto;
  }


  .progress-equalizer {
    display: block;

    width: 100%;

    min-width: 410px;

    height: 190px;

    color:
      var(
        --viz-progress-bar,
        var(--primary)
      );

    overflow: visible;
  }


  .attempt-hit-area {
    fill: transparent;

    cursor: pointer;
  }


  .attempt-shape {
    fill:
      currentColor;
  }


  g.empty
    .attempt-shape {
    opacity: 0.22;
  }


  g.occupied:not(.selected)
    .attempt-shape {
    opacity: 0.72;
  }


  g.selected
    .attempt-shape {
    opacity: 1;
  }


  .latest-marker {
    fill:
      var(
        --viz-progress-latest,
        var(--primary)
      );
  }


  .selected-attempt {
    min-height: 42px;

    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      auto
      auto;

    align-items: center;

    gap:
      var(--space-4);

    padding-top:
      var(--space-3);

    border-top:
      1px solid
      var(--border-soft);
  }


  .selected-attempt > div:first-child {
    min-width: 0;

    display: grid;

    gap: 3px;
  }


  .attempt-label,
  .selected-score span {
    color:
      var(--text-muted);

    font-size: 10px;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .selected-attempt strong {
    overflow: hidden;

    text-overflow:
      ellipsis;

    white-space: nowrap;

    font-size: 12px;
  }


  .selected-score {
    display: grid;

    text-align: right;
  }


  .selected-score strong {
    color:
      var(--primary);

    font-size: 19px;

    font-variant-numeric:
      tabular-nums;
  }


  .selected-attempt a {
    display: inline-flex;

    align-items: center;

    gap:
      var(--space-1);

    color:
      var(--primary);

    font-size: 11px;

    font-weight: 600;

    text-decoration: none;
  }


  .progress-metrics {
    display: grid;

    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .progress-metrics > div {
    min-width: 0;

    display: flex;

    align-items: baseline;

    justify-content:
      space-between;

    gap:
      var(--space-3);

    padding:
      var(--space-3)
      var(--space-4);

    border-right:
      1px solid
      var(--border-soft);
  }


  .progress-metrics > div:last-child {
    border-right: 0;
  }


  .progress-metrics span {
    color:
      var(--text-muted);

    font-size: 10px;

    letter-spacing:
      0.05em;

    text-transform:
      uppercase;
  }


  .progress-metrics strong {
    color:
      var(--text);

    font-size: 17px;

    font-variant-numeric:
      tabular-nums;
  }


  @media (
    max-width: 600px
  ) {
    .selected-attempt {
      grid-template-columns:
        minmax(0, 1fr)
        auto;
    }


    .selected-attempt a {
      grid-column:
        1 / -1;
    }


    .progress-metrics {
      grid-template-columns:
        1fr;
    }


    .progress-metrics > div {
      border-right: 0;

      border-bottom:
        1px solid
        var(--border-soft);
    }


    .progress-metrics > div:last-child {
      border-bottom: 0;
    }
  }
</style>
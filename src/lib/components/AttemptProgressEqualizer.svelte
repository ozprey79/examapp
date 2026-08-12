<script>
  import {
    onMount
  } from 'svelte';


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


  let reduceMotion =
    $state(false);


  onMount(() => {
    const motionQuery =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );


    const updateMotionPreference =
      () => {
        reduceMotion =
          motionQuery.matches;
      };


    updateMotionPreference();
    motionQuery.addEventListener(
      'change',
      updateMotionPreference
    );


    return () => {
      motionQuery.removeEventListener(
        'change',
        updateMotionPreference
      );
    };
  });


  function getTotalQuestions(
    attempt
  ) {
    const explicitTotal =
      Number(
        attempt?.totalQuestions ??
        attempt?.total_questions ??
        attempt?.questionCount ??
        attempt?.question_count
      );


    if (
      Number.isFinite(
        explicitTotal
      ) &&
      explicitTotal > 0
    ) {
      return explicitTotal;
    }


    const correct =
      Number(
        attempt?.correct ??
        attempt?.correctCount ??
        0
      );


    const wrong =
      Number(
        attempt?.wrong ??
        attempt?.wrongCount ??
        0
      );


    const skipped =
      Number(
        attempt?.skipped ??
        attempt?.skippedCount ??
        0
      );


    const derivedTotal =
      correct +
      wrong +
      skipped;


    if (
      Number.isFinite(
        derivedTotal
      ) &&
      derivedTotal > 0
    ) {
      return derivedTotal;
    }


    return null;
  }


  function getNormalizedScore(
    attempt
  ) {
    if (!attempt) {
      return null;
    }


    const rawScore =
      Number(
        attempt.score
      );


    const totalQuestions =
      getTotalQuestions(
        attempt
      );


    if (
      !Number.isFinite(
        rawScore
      ) ||
      totalQuestions === null
    ) {
      return null;
    }


    return (
      rawScore /
      totalQuestions
    ) * 100;
  }


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
    $derived.by(() => {
      const normalizedScores =
        attempts
          .map(
            (attempt) =>
              getNormalizedScore(
                attempt
              )
          )
          .filter(
            (score) =>
              score !== null
          );


      return normalizedScores.length
        ? Math.max(
            ...normalizedScores
          )
        : null;
    });


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
        visibleAttempts.length -
        1;
    }
  });
</script>


<div class="progress-visual">

  <div class="chart-identifier">
    <strong>Normalized score by attempt</strong>
    <span>Bar height shows score · A1, A2… identify attempt order</span>
  </div>

  <div class="chart-wrap">

    <div class="chart-stage">

      <div class="score-axis" aria-hidden="true">
        <span class="score-maximum">100%</span>
        <span class="score-zero">0%</span>
      </div>

      <div class="chart-series">

    <svg
      class="progress-equalizer"

      viewBox={`0 0 ${
        VISIBLE_SLOTS *
        SLOT_WIDTH
      } ${CHART_HEIGHT}`}

      role="img"

      aria-label="Normalized score progress across recent attempts"
    >

      <defs>

        <linearGradient
          id="attempt-progress-gradient"

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


      <g class="score-guides" aria-hidden="true">
        <line
          x1="0"
          y1={getY(MAX_HEIGHT)}
          x2={VISIBLE_SLOTS * SLOT_WIDTH}
          y2={getY(MAX_HEIGHT)}
        />

        <line
          class="zero-guide"
          x1="0"
          y1={CHART_HEIGHT / 2}
          x2={VISIBLE_SLOTS * SLOT_WIDTH}
          y2={CHART_HEIGHT / 2}
        />
      </g>


      {#each displayedSlots as slot, index}

        {@const normalizedScore =
          slot.occupied
            ? getNormalizedScore(
                slot
              )
            : 0}


        {@const score =
          clampScore(
            normalizedScore
          )}


        {@const targetHeight =
          getHeight(
            score
          )}


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

              role="button"
              tabindex="0"
              aria-label={`Attempt ${slot.attemptNumber}, ${formatScore(normalizedScore)} percent normalized score${index === visibleAttempts.length - 1 ? ', latest attempt' : ''}`}

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

              onfocus={() => {
                selectedIndex =
                  index;
              }}

              onkeydown={(event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  event.preventDefault();
                  selectedIndex = index;
                }
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

            fill={
              slot.occupied
                ? 'url(#attempt-progress-gradient)'
                : 'var(--border-soft)'
            }
          >

            {#if slot.occupied && !reduceMotion}

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


        <div
          class="attempt-axis"
          role="group"
          aria-label="Attempt order"
        >
          {#each displayedSlots as slot}
            <span
              class:occupied={slot.occupied}
              class:latest={slot.occupied && slot.attemptNumber === totalAttempts}
            >
              {slot.occupied ? `A${slot.attemptNumber}` : ''}
            </span>
          {/each}
        </div>

      </div>

    </div>

  </div>


  <div
    class="chart-key"
    role="list"
    aria-label="Visualization key"
  >
    <span role="listitem">
      <i class="selected-key" aria-hidden="true"></i>
      Selected attempt
    </span>

    <span role="listitem">
      <i class="latest-key" aria-hidden="true"></i>
      Latest attempt
    </span>
  </div>


  {#if selectedAttempt?.occupied}

    <div class="selected-attempt">

      <div>

        <span class="attempt-label">
          Attempt
          {selectedAttempt.attemptNumber}
        </span>


        <strong>
          {selectedAttempt.testTitle}
        </strong>

      </div>


      <div class="selected-score">

        <strong>
          {getNormalizedScore(
            selectedAttempt
          ) === null
            ? '—'
            : `${formatScore(
                getNormalizedScore(
                  selectedAttempt
                )
              )}%`}
        </strong>


        <span>
          normalized score
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
        Best normalized
      </span>

      <strong>
        {bestScore === null
          ? '—'
          : `${formatScore(
              bestScore
            )}%`}
      </strong>

    </div>


    <div>

      <span>
        Latest normalized
      </span>

      <strong>
        {attempts.length &&
        getNormalizedScore(
          attempts[
            attempts.length -
              1
          ]
        ) !== null
          ? `${formatScore(
              getNormalizedScore(
                attempts[
                  attempts.length -
                    1
                ]
              )
            )}%`
          : '—'}
      </strong>

    </div>

  </div>

</div>


<style>
  .progress-visual {
    width:
      100%;

    display:
      grid;

    gap:
      var(--space-4);
  }


  .chart-identifier {
    display:
      flex;

    align-items:
      baseline;

    justify-content:
      space-between;

    gap:
      var(--space-4);

    font-family:
      var(--font-ui);

    animation:
      result-detail-in
      420ms
      ease-out
      both;
  }


  .chart-identifier strong {
    color:
      var(--text);

    font-size:
      12px;
  }


  .chart-identifier span {
    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      10px;
  }


  .chart-wrap {
    width:
      100%;

    overflow-x:
      auto;

    padding:
      0;

    background:
      transparent;

    border:
      0;

    border-radius:
      0;
  }


  .chart-stage {
    min-width:
      454px;

    display:
      grid;

    grid-template-columns:
      36px
      minmax(410px, 1fr);

    gap:
      var(--space-2);
  }


  .score-axis {
    position:
      relative;

    height:
      190px;

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      9px;

    font-variant-numeric:
      tabular-nums;

    animation:
      result-detail-in
      420ms
      80ms
      ease-out
      both;
  }


  .score-axis span {
    position:
      absolute;

    right:
      0;

    transform:
      translateY(-50%);
  }


  .score-maximum {
    top:
      9.42%;
  }


  .score-zero {
    top:
      50%;
  }


  .chart-series {
    min-width:
      410px;

    display:
      grid;
  }


  .progress-equalizer {
    display:
      block;

    width:
      100%;

    min-width:
      410px;

    height:
      190px;

    color:
      var(
        --viz-progress-bar,
        var(--primary)
      );

    overflow:
      visible;
  }


  .score-guides line {
    stroke:
      var(--border-soft);

    stroke-width:
      0.8;

    stroke-dasharray:
      2 4;

    vector-effect:
      non-scaling-stroke;
  }


  .score-guides .zero-guide {
    stroke-dasharray:
      none;

    opacity:
      0.68;
  }


  .attempt-axis {
    display:
      grid;

    grid-template-columns:
      repeat(
        18,
        minmax(0, 1fr)
      );

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      8px;

    font-variant-numeric:
      tabular-nums;

    text-align:
      center;

    animation:
      result-detail-in
      420ms
      220ms
      ease-out
      both;
  }


  .attempt-axis span {
    min-width:
      0;
  }


  .attempt-axis span.occupied {
    color:
      var(--text);
  }


  .attempt-axis span.latest {
    color:
      var(--primary);

    font-weight:
      700;
  }


  .attempt-hit-area {
    fill:
      transparent;

    cursor:
      pointer;
  }


  .attempt-hit-area:focus {
    outline:
      none;
  }


  .attempt-shape {
    stroke:
      color-mix(
        in srgb,
        var(--text) 72%,
        transparent
      );

    stroke-width:
      1;

    vector-effect:
      non-scaling-stroke;

    transition:
      opacity
      160ms
      ease,
      stroke
      160ms
      ease,
      stroke-width
      160ms
      ease;
  }


  g.empty
  .attempt-shape {
    opacity:
      0.22;
  }


  g.occupied:not(.selected)
  .attempt-shape {
    opacity:
      0.72;
  }


  g.selected
  .attempt-shape {
    opacity:
      1;

    stroke:
      var(--primary);

    stroke-width:
      2;

    animation:
      attempt-select-pulse
      320ms
      ease-out;
  }


  .latest-marker {
    fill:
      var(
        --viz-progress-latest,
        var(--primary)
      );

    transform-box:
      fill-box;

    transform-origin:
      center;

    animation:
      latest-marker-in
      520ms
      680ms
      cubic-bezier(0.2, 0.85, 0.25, 1.15)
      both;
  }


  .chart-key {
    display:
      flex;

    flex-wrap:
      wrap;

    align-items:
      center;

    gap:
      var(--space-4);

    color:
      var(--text-muted);

    font-family:
      var(--font-metadata);

    font-size:
      10px;

    animation:
      result-detail-in
      420ms
      300ms
      ease-out
      both;
  }


  @keyframes result-detail-in {
    from {
      opacity:
        0;

      transform:
        translateY(5px);
    }

    to {
      opacity:
        1;

      transform:
        translateY(0);
    }
  }


  @keyframes attempt-select-pulse {
    from {
      filter:
        brightness(1.35);
    }

    to {
      filter:
        none;
    }
  }


  @keyframes latest-marker-in {
    from {
      opacity:
        0;

      transform:
        scale(0);
    }

    72% {
      transform:
        scale(1.5);
    }

    to {
      opacity:
        1;

      transform:
        scale(1);
    }
  }


  .chart-key span {
    display:
      inline-flex;

    align-items:
      center;

    gap:
      var(--space-2);
  }


  .chart-key i {
    width:
      9px;

    height:
      9px;

    display:
      block;
  }


  .selected-key {
    border:
      2px solid
      var(--primary);

    border-radius:
      999px;
  }


  .latest-key {
    background:
      var(--primary);

    border-radius:
      50%;
  }


  .selected-attempt {
    min-height:
      42px;

    display:
      grid;

    grid-template-columns:
      minmax(0, 1fr)
      auto
      auto;

    align-items:
      center;

    gap:
      var(--space-4);

    padding-top:
      var(--space-3);

    border-top:
      1px solid
      var(--border-soft);
  }


  .selected-attempt > div:first-child {
    min-width:
      0;

    display:
      grid;

    gap:
      3px;
  }


  .attempt-label,
  .selected-score span {
    color:
      var(--text-muted);

    font-size:
      10px;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  .selected-attempt strong {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;

    font-size:
      12px;
  }


  .selected-score {
    display:
      grid;

    text-align:
      right;
  }


  .selected-score strong {
    color:
      var(--primary);

    font-family:
      var(--font-heading);

    font-size:
      19px;

    font-variant-numeric:
      tabular-nums;
  }


  .selected-attempt a {
    display:
      inline-flex;

    align-items:
      center;

    gap:
      var(--space-1);

    color:
      var(--primary);

    font-size:
      11px;

    font-weight:
      600;

    text-decoration:
      none;
  }


  .progress-metrics {
    display:
      grid;

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
      var(--space-3)
      var(--space-4);

    border-right:
      1px solid
      var(--border-soft);
  }


  .progress-metrics > div:last-child {
    border-right:
      0;
  }


  .progress-metrics span {
    color:
      var(--text-muted);

    font-size:
      10px;

    letter-spacing:
      0.05em;

    text-transform:
      uppercase;
  }


  .progress-metrics strong {
    color:
      var(--text);

    font-family:
      var(--font-heading);

    font-size:
      17px;

    font-variant-numeric:
      tabular-nums;
  }


  @media (
    max-width: 600px
  ) {

    .chart-identifier {
      align-items:
        flex-start;

      flex-direction:
        column;

      gap:
        var(--space-1);
    }

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
      border-right:
        0;

      border-bottom:
        1px solid
        var(--border-soft);
    }


    .progress-metrics > div:last-child {
      border-bottom:
        0;
    }

  }


  @media (
    prefers-reduced-motion: reduce
  ) {

    .chart-identifier,
    .score-axis,
    .attempt-axis,
    .attempt-shape,
    .latest-marker,
    .chart-key {
      animation:
        none;

      transition:
        none;
    }

  }
</style>

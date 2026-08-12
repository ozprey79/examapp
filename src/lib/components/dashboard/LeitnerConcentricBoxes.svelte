<script>
  let {
    questions = []
  } = $props();


  const WIDTH = 560;
  const HEIGHT = 560;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;


  const BOXES = [
    {
      number: 1,
      boundaryRadius: 250,
      nodeRadius: 228,
      interval: 'Every day'
    },
    {
      number: 2,
      boundaryRadius: 205,
      nodeRadius: 183,
      interval: 'Every 3 days'
    },
    {
      number: 3,
      boundaryRadius: 160,
      nodeRadius: 138,
      interval: 'Every 7 days'
    },
    {
      number: 4,
      boundaryRadius: 115,
      nodeRadius: 93,
      interval: 'Every 14 days'
    },
    {
      number: 5,
      boundaryRadius: 70,
      nodeRadius: 40,
      interval: 'Every 30 days'
    }
  ];


  let boxSummaries =
    $derived.by(
      () =>
        BOXES.map(
          (box) => ({
            ...box,
            questions:
              questions.filter(
                (question) =>
                  normalizeBox(
                    question.box
                  ) === box.number
              )
          })
        )
    );


  let nodes =
    $derived.by(
      () =>
        boxSummaries.flatMap(
          (box) =>
            positionQuestions(
              box
            )
        )
    );


  let dueCount =
    $derived(
      questions.filter(
        (question) =>
          question.due
      ).length
    );


  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );
  }


  function normalizeBox(
    value
  ) {
    return clamp(
      Number.isFinite(
        Number(value)
      )
        ? Number(value)
        : 1,
      1,
      5
    );
  }


  function boxColor(
    box
  ) {
    return (
      `var(--leitner-box-${box})`
    );
  }


  function positionQuestions(
    box
  ) {
    const count =
      box.questions.length;

    if (count === 0) {
      return [];
    }

    const maximumTracks =
      box.number === 5
        ? 3
        : 5;

    const trackCount =
      clamp(
        Math.ceil(
          count / 28
        ),
        1,
        maximumTracks
      );

    const questionsPerTrack =
      Math.ceil(
        count / trackCount
      );

    const approximateSpacing =
      (
        Math.PI *
        2 *
        Math.max(
          box.nodeRadius,
          28
        )
      ) /
      Math.max(
        questionsPerTrack,
        1
      );

    const dotRadius =
      clamp(
        approximateSpacing * 0.27,
        2.4,
        5.5
      );

    return box.questions.map(
      (
        question,
        index
      ) => {
        const track =
          index % trackCount;

        const position =
          Math.floor(
            index / trackCount
          );

        const radius =
          box.nodeRadius +
          (
            track -
            (
              trackCount - 1
            ) / 2
          ) *
            8;

        const angle =
          -Math.PI / 2 +
          (
            position /
            Math.max(
              questionsPerTrack,
              1
            )
          ) *
            Math.PI *
            2 +
          track * 0.055 +
          box.number * 0.08;

        return {
          ...question,
          box:
            box.number,
          x:
            CENTER_X +
            Math.cos(angle) *
              radius,
          y:
            CENTER_Y +
            Math.sin(angle) *
              radius,
          radius:
            question.due
              ? dotRadius + 0.8
              : dotRadius
        };
      }
    );
  }
</script>


<section class="leitner-viz">
  <header class="viz-header">
    <div>
      <p class="viz-eyebrow">
        Revision state
      </p>

      <h2>
        Concentric Leitner boxes
      </h2>

      <p class="viz-description">
        Questions move inward as recall strengthens. Box 1 is the outer ring; Box 5 is the centre.
      </p>
    </div>

    <div class="viz-summary">
      <div>
        <span>Learned</span>
        <strong>{questions.length}</strong>
      </div>

      <div>
        <span>Due now</span>
        <strong>{dueCount}</strong>
      </div>
    </div>
  </header>


  <div class="chart-frame">
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Leitner distribution with ${questions.length} learned questions across five concentric boxes. ${dueCount} questions are due now.`}
    >
      <defs>
        {#each BOXES as box}
          <radialGradient
            id={`leitner-ball-mesh-${box.number}`}
            cx={box.number % 2 === 0 ? "70%" : "28%"}
            cy={box.number % 2 === 0 ? "24%" : "30%"}
            r="92%"
            fx={box.number % 2 === 0 ? "76%" : "22%"}
            fy={box.number % 2 === 0 ? "18%" : "24%"}
          >
            <stop
              offset="0%"
              stop-color={boxColor(
                box.number
              )}
            />

            <stop
              offset="42%"
              stop-color={box.number <= 3
                ? "var(--viz-spectrum-2)"
                : "var(--viz-spectrum-4)"}
            />

            <stop
              offset="76%"
              stop-color={box.number <= 3
                ? "var(--viz-spectrum-5)"
                : "var(--viz-spectrum-1)"}
            />

            <stop
              offset="100%"
              stop-color={boxColor(
                box.number
              )}
              stop-opacity="0.88"
            />
          </radialGradient>
        {/each}
      </defs>


      {#each [0, 45, 90, 135] as angle}
        <line
          class="radial-guide"
          x1={CENTER_X - Math.cos(angle * Math.PI / 180) * 250}
          y1={CENTER_Y - Math.sin(angle * Math.PI / 180) * 250}
          x2={CENTER_X + Math.cos(angle * Math.PI / 180) * 250}
          y2={CENTER_Y + Math.sin(angle * Math.PI / 180) * 250}
        />
      {/each}


      {#each boxSummaries as box}
        <circle
          class="box-ring"
          cx={CENTER_X}
          cy={CENTER_Y}
          r={box.boundaryRadius}
          style:stroke={boxColor(
            box.number
          )}
        />

        {#if box.number < 5}
          <g class="ring-label">
            <circle
              cx={CENTER_X + box.boundaryRadius * 0.72}
              cy={CENTER_Y - box.boundaryRadius * 0.69}
              r="13"
              fill="var(--surface-strong)"
              style:stroke={boxColor(
                box.number
              )}
            />

            <text
              x={CENTER_X + box.boundaryRadius * 0.72}
              y={CENTER_Y - box.boundaryRadius * 0.69 + 4}
              text-anchor="middle"
            >
              {box.number}
            </text>
          </g>
        {/if}
      {/each}


      {#each nodes as node (node.id)}
        <circle
          class="question-dot"
          class:due={node.due}
          cx={node.x}
          cy={node.y}
          r={node.radius}
          fill={`url(#leitner-ball-mesh-${node.box})`}
        >
          <title>
            Box {node.box}{node.module ? ` · ${node.module}` : ''}{node.topic ? ` · ${node.topic}` : ''}{node.due ? ' · Due now' : ''}
          </title>
        </circle>
      {/each}


      <g class="centre-label">
        <text
          class="centre-eyebrow"
          x={CENTER_X}
          y={CENTER_Y - 9}
          text-anchor="middle"
        >
          BOX 5
        </text>

        <text
          class="centre-count"
          x={CENTER_X}
          y={CENTER_Y + 22}
          text-anchor="middle"
        >
          {boxSummaries[4].questions.length}
        </text>
      </g>


      {#if questions.length === 0}
        <text
          class="empty-label"
          x={CENTER_X}
          y={CENTER_Y + 58}
          text-anchor="middle"
        >
          Complete a test to place questions in the system
        </text>
      {/if}
    </svg>
  </div>


  <footer
    class="box-legend"
    aria-label="Leitner box counts and review intervals"
  >
    {#each boxSummaries as box}
      <a
        href={`/student/revision/practice/box-${box.number}`}
        class="legend-item"
      >
        <span
          class="legend-dot"
          style:background-color={boxColor(
            box.number
          )}
        ></span>

        <span>
          Box {box.number}
          <small>{box.interval}</small>
        </span>

        <strong>
          {box.questions.length}
        </strong>
      </a>
    {/each}
  </footer>


  <p class="due-key">
    <span aria-hidden="true"></span>
    Outlined dots are due for review.
  </p>
</section>


<style>
  .leitner-viz {
    display: grid;
    gap: var(--space-4);
  }

  .viz-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-6);
  }

  .viz-eyebrow,
  .viz-description {
    margin: 0;
  }

  .viz-eyebrow {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .viz-header h2 {
    margin: var(--space-1) 0;
  }

  .viz-description {
    max-width: 620px;
    color: var(--text-muted);
    font-family: var(--font-reading);
    line-height: 1.5;
  }

  .viz-summary {
    display: flex;
    gap: var(--space-6);
  }

  .viz-summary div {
    display: grid;
    gap: 2px;
    text-align: right;
  }

  .viz-summary span {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 11px;
    text-transform: uppercase;
  }

  .viz-summary strong {
    color: var(--text);
    font-family: var(--font-heading);
    font-size: 24px;
    font-variant-numeric: tabular-nums;
  }

  .chart-frame {
    position: relative;
    overflow: hidden;
    background: transparent;
    border: 0;
    border-radius: 0;
  }

  svg {
    display: block;
    width: min(100%, 720px);
    aspect-ratio: 1;
    margin-inline: auto;
  }

  .radial-guide {
    stroke: var(--border-soft);
    stroke-width: 1;
    stroke-dasharray: 2 8;
    opacity: 0.7;
  }

  .box-ring {
    fill: none;
    stroke-width: 1.2;
    opacity: 0.62;
  }

  .ring-label circle {
    stroke-width: 1;
  }

  .ring-label text {
    fill: var(--text);
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 600;
  }

  .question-dot {
    opacity: 0.84;
  }

  .question-dot.due {
    stroke: var(--text);
    stroke-width: 2;
    paint-order: stroke;
  }

  .centre-eyebrow {
    fill: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 10px;
    letter-spacing: 0.12em;
  }

  .centre-count {
    fill: var(--leitner-box-5);
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 600;
  }

  .empty-label {
    fill: var(--text-muted);
    font-family: var(--font-reading);
    font-size: 12px;
  }

  .box-legend {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  .legend-item {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    color: var(--text);
    text-decoration: none;
  }

  .legend-item + .legend-item {
    border-left: 1px solid var(--border-soft);
  }

  .legend-item:hover {
    background: var(--surface-hover);
  }

  .legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .legend-item > span:nth-child(2) {
    display: grid;
    gap: 2px;
    font-size: 12px;
    font-weight: 600;
  }

  .legend-item small {
    overflow: hidden;
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 10px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .legend-item strong {
    font-family: var(--font-heading);
    font-size: 18px;
    font-variant-numeric: tabular-nums;
  }

  .due-key {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 11px;
  }

  .due-key span {
    width: 9px;
    height: 9px;
    border: 2px solid var(--text);
    border-radius: 50%;
  }

  @media (max-width: 760px) {
    .viz-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .viz-summary div {
      text-align: left;
    }

    .box-legend {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .legend-item + .legend-item {
      border-left: 0;
    }

    .legend-item:nth-child(even) {
      border-left: 1px solid var(--border-soft);
    }

    .legend-item:nth-child(n + 3) {
      border-top: 1px solid var(--border-soft);
    }
  }

  @media (max-width: 480px) {
    .box-legend {
      grid-template-columns: 1fr;
    }

    .legend-item:nth-child(even),
    .legend-item + .legend-item {
      border-top: 1px solid var(--border-soft);
      border-left: 0;
    }
  }
</style>

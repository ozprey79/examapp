<script>
  import { onMount } from 'svelte';

  import {
    select,
    pointer
  } from 'd3-selection';

  import {
    forceSimulation,
    forceX,
    forceY,
    forceCollide,
    forceManyBody
  } from 'd3-force';

  import {
    drag
  } from 'd3-drag';


  let {
    questions = []
  } = $props();


  const WIDTH = 920;
  const HEIGHT = 500;
  const EDGE = 18;

  const MIN_RADIUS = 8;
  const MAX_RADIUS = 26;
  const DEFAULT_DIFFICULTY = 0.5;

  const POINTER_RADIUS = 42;


  let svgElement;

  let nodes = $state([]);


  function clamp(
    value,
    min,
    max
  ) {
    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );
  }


  function difficultyValue(
    node
  ) {
    if (
      node.difficulty === null ||
      node.difficulty === undefined ||
      node.difficulty === ''
    ) {
      return DEFAULT_DIFFICULTY;
    }

    const value =
      Number(
        node.difficulty
      );

    if (
      !Number.isFinite(
        value
      )
    ) {
      return DEFAULT_DIFFICULTY;
    }

    return clamp(
      value,
      0,
      1
    );
  }


  function nodeRadius(
    node
  ) {
    if (
      node.isPointer
    ) {
      return POINTER_RADIUS;
    }

    const difficulty =
      difficultyValue(
        node
      );

    return (
      MIN_RADIUS +
      difficulty *
        (
          MAX_RADIUS -
          MIN_RADIUS
        )
    );
  }


  function boxNumber(
    node
  ) {
    return clamp(
      Number.isFinite(
        Number(node.box)
      )
        ? Number(node.box)
        : 1,
      1,
      5
    );
  }


  function boxColor(
    box
  ) {
    const colors = {
      1:
        'var(--leitner-box-1)',
      2:
        'var(--leitner-box-2)',
      3:
        'var(--leitner-box-3)',
      4:
        'var(--leitner-box-4)',
      5:
        'var(--leitner-box-5)'
    };

    return (
      colors[box] ??
      colors[1]
    );
  }


  function boxGradientId(
    box
  ) {
    return (
      `leitner-box-gradient-${box}`
    );
  }


  function formatDifficulty(
    node
  ) {
    if (
      node.difficulty === null ||
      node.difficulty === undefined ||
      node.difficulty === '' ||
      !Number.isFinite(
        Number(
          node.difficulty
        )
      )
    ) {
      return 'Standard';
    }

    return (
      `${Math.round(
        difficultyValue(node) *
        100
      )}%`
    );
  }


  function countForBox(
    box
  ) {
    return questions.filter(
      (question) =>
        Number(
          question.box
        ) === box
    ).length;
  }


  onMount(() => {

    /*
      The pointer is an invisible simulation node.
      It begins outside the chart so it does not
      affect the bubbles until the mouse enters.
    */

    const pointerNode = {
      id:
        '__pointer__',

      isPointer:
        true,

      x:
        -1000,

      y:
        -1000,

      fx:
        -1000,

      fy:
        -1000
    };


    const questionNodes =
      questions.map(
        (question) => ({
          ...question,

          box:
            Number(
              question.box ??
              1
            ),

          x:
            WIDTH / 2 +
            (
              Math.random() -
              0.5
            ) * 260,

          y:
            HEIGHT / 2 +
            (
              Math.random() -
              0.5
            ) * 160
        })
      );


    /*
      Important:
      the simulation owns this array.
      Svelte receives new array references
      on each tick, but the node objects stay
      shared with D3.
    */

    const simulationNodes = [
      pointerNode,
      ...questionNodes
    ];

    nodes = [
      ...simulationNodes
    ];


    const simulation =
      forceSimulation(
        simulationNodes
      )

        /*
          Very soft centering:
          enough to keep the cloud together,
          but weak enough for fluid movement.
        */

        .force(
          'x',

          forceX(
            WIDTH / 2
          )
            .strength(
              0.016
            )
        )

        .force(
          'y',

          forceY(
            HEIGHT / 2
          )
            .strength(
              0.022
            )
        )

        /*
          Visible radius = difficulty.
          Collision radius follows the same
          radius, with a small breathing gap.
          The pointer has its own larger radius.
        */

        .force(
          'collision',

          forceCollide(
            (node) =>
              node.isPointer
                ? POINTER_RADIUS
                : nodeRadius(node) +
                  4
          )
            .strength(
              1
            )
            .iterations(
              4
            )
        )

        .force(
          'charge',

          forceManyBody()
            .strength(
              (node) =>
                node.isPointer
                  ? 0
                  : -6
            )
        )

        /*
          Lower velocity decay makes motion
          persist longer and feel less rigid.
        */

        .velocityDecay(
          0.16
        )

        .alphaDecay(
          0.028
        )

        .on(
          'tick',
          () => {

            for (
              const node of
              simulationNodes
            ) {

              /*
                Never clamp the invisible
                pointer node. It must be able
                to live outside the SVG.
              */

              if (
                node.isPointer
              ) {
                continue;
              }


              const radius =
                nodeRadius(
                  node
                );


              node.x =
                clamp(
                  node.x,
                  EDGE +
                    radius,
                  WIDTH -
                    EDGE -
                    radius
                );


              node.y =
                clamp(
                  node.y,
                  EDGE +
                    radius,
                  HEIGHT -
                    EDGE -
                    radius
                );
            }


            nodes = [
              ...simulationNodes
            ];
          }
        );


    const svg =
      select(
        svgElement
      );


    /*
      Fluid mouse interaction.

      Moving the mouse moves the invisible
      collider through the cloud and reheats
      the simulation.
    */

    svg.on(
      'pointermove.leitner',

      (event) => {

        const [
          x,
          y
        ] =
          pointer(
            event,
            svgElement
          );


        pointerNode.fx =
          x;

        pointerNode.fy =
          y;

        pointerNode.x =
          x;

        pointerNode.y =
          y;


        simulation
          .alphaTarget(
            0.10
          )
          .restart();
      }
    );


    /*
      Remove the invisible collider when the
      pointer leaves, then allow the cloud to
      settle naturally.
    */

    svg.on(
      'pointerleave.leitner',

      () => {

        pointerNode.fx =
          -1000;

        pointerNode.fy =
          -1000;

        pointerNode.x =
          -1000;

        pointerNode.y =
          -1000;


        simulation
          .alphaTarget(
            0
          )
          .alpha(
            Math.max(
              simulation.alpha(),
              0.22
            )
          )
          .restart();
      }
    );


    /*
      Attach each Svelte-rendered circle to its
      corresponding D3 node. This prevents the
      invisible pointer node from becoming the
      drag subject.
    */

    const nodeSelection =
      svg
        .selectAll(
          '.leitner-node'
        )
        .data(
          questionNodes,
          (node) =>
            node.id
        );


    nodeSelection.call(
      drag()

        .subject(
          (
            _event,
            node
          ) =>
            node
        )

        .on(
          'start',

          (event) => {

            if (
              !event.active
            ) {
              simulation
                .alphaTarget(
                  0.24
                )
                .restart();
            }


            event.subject.fx =
              event.subject.x;

            event.subject.fy =
              event.subject.y;
          }
        )

        .on(
          'drag',

          (event) => {

            event.subject.fx =
              event.x;

            event.subject.fy =
              event.y;
          }
        )

        .on(
          'end',

          (event) => {

            event.subject.fx =
              null;

            event.subject.fy =
              null;


            if (
              !event.active
            ) {
              simulation
                .alphaTarget(
                  0
                );
            }


            simulation
              .alpha(
                Math.max(
                  simulation.alpha(),
                  0.30
                )
              )
              .restart();
          }
        )
    );


    return () => {

      svg.on(
        '.leitner',
        null
      );

      simulation.stop();
    };
  });
</script>


<section class="leitner-viz">

  <header class="viz-header">

    <div>

      <p class="viz-eyebrow">
        Revision state
      </p>

      <h2>
        Leitner distribution
      </h2>

    </div>


    <div class="viz-summary">

      <strong>
        {questions.length}
      </strong>

      <span>
        learned questions
      </span>

    </div>

  </header>


  <div class="chart-frame">

    <svg
      bind:this={svgElement}

      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}

      role="img"

      aria-label="Leitner question distribution. Circle size represents difficulty and color represents Leitner box."
    >

      <defs>

        {#each [1, 2, 3, 4, 5] as box}

          <radialGradient
            id={boxGradientId(
              box
            )}

            cx="50%"
            cy="0%"
            r="100%"

            fx="50%"
            fy="0%"
          >

            <stop
              offset="0%"
              stop-color={boxColor(
                box
              )}
              stop-opacity="0.20"
            />

            <stop
              offset="48%"
              stop-color={boxColor(
                box
              )}
              stop-opacity="0.58"
            />

            <stop
              offset="100%"
              stop-color={boxColor(
                box
              )}
              stop-opacity="1"
            />

          </radialGradient>

        {/each}

      </defs>


      {#each nodes.filter((node) => !node.isPointer) as node (node.id)}

        <circle
          class="leitner-node"
          class:due={node.due}

          cx={node.x}
          cy={node.y}

          r={nodeRadius(
            node
          )}

          fill={`url(#${boxGradientId(
            boxNumber(
              node
            )
          )})`}
        >

          <title>
            Box {boxNumber(node)}
            · Difficulty {formatDifficulty(node)}
            {node.module
              ? ` · ${node.module}`
              : ''}
            {node.topic
              ? ` · ${node.topic}`
              : ''}
            {node.due
              ? ' · Due now'
              : ''}
          </title>

        </circle>

      {/each}

    </svg>

  </div>


  <footer class="viz-legend">

    <div
      class="box-legend"
      aria-label="Leitner box colors"
    >

      {#each [1, 2, 3, 4, 5] as box}

        <span class="legend-item">

          <span
            class="legend-dot"

            style:background-color={
              boxColor(
                box
              )
            }
          ></span>

          <span>
            Box {box}
          </span>

          <strong>
            {countForBox(
              box
            )}
          </strong>

        </span>

      {/each}

    </div>


    <div
      class="difficulty-legend"
      aria-label="Difficulty circle size"
    >

      <span class="legend-title">
        Radius = difficulty
      </span>

      <span class="radius-example radius-low"></span>
      <span>Low</span>

      <span class="radius-example radius-standard"></span>
      <span>Standard / null</span>

      <span class="radius-example radius-high"></span>
      <span>High</span>

      <span class="due-key">
        outlined = due
      </span>

    </div>

  </footer>

</section>


<style>
  .leitner-viz {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .viz-header {
    display:
      flex;

    justify-content:
      space-between;

    align-items:
      end;

    gap:
      var(--space-4);
  }


  .viz-eyebrow {
    margin:
      0 0
      var(--space-1);

    color:
      var(--text-muted);
  }


  .viz-header h2 {
    margin:
      0;
  }


  .viz-summary {
    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-2);

    color:
      var(--text-muted);
  }


  .viz-summary strong {
    color:
      var(--text);
  }


  .chart-frame {
    overflow:
      hidden;

    border-top:
      1px solid
      var(--border);

    border-bottom:
      1px solid
      var(--border);
  }


  svg {
    display:
      block;

    width:
      100%;

    touch-action:
      none;
  }


  .leitner-node {
    cursor:
      grab;
  }


  .leitner-node:active {
    cursor:
      grabbing;
  }


  .leitner-node.due {
    stroke:
      var(--primary);

    stroke-width:
      0.7;
  }


  .viz-legend {
    display:
      grid;

    gap:
      var(--space-3);

    color:
      var(--text-muted);
  }


  .box-legend,
  .difficulty-legend,
  .legend-item {
    display:
      flex;

    align-items:
      center;
  }


  .box-legend {
    flex-wrap:
      wrap;

    gap:
      var(--space-3);
  }


  .legend-item {
    gap:
      var(--space-2);
  }


  .legend-item strong {
    color:
      var(--text);

    font-variant-numeric:
      tabular-nums;
  }


  .legend-dot {
    width:
      var(--space-3);

    height:
      var(--space-3);

    border-radius:
      50%;
  }


  .difficulty-legend {
    flex-wrap:
      wrap;

    gap:
      var(--space-2);
  }


  .legend-title {
    margin-right:
      var(--space-2);

    color:
      var(--text);
  }


  .radius-example {
    display:
      inline-block;

    flex:
      0 0 auto;

    border:
      1px solid
      var(--border);

    border-radius:
      50%;
  }


  .radius-low {
    width:
      var(--space-2);

    height:
      var(--space-2);
  }


  .radius-standard {
    width:
      var(--space-3);

    height:
      var(--space-3);
  }


  .radius-high {
    width:
      var(--space-4);

    height:
      var(--space-4);
  }


  .due-key {
    margin-left:
      var(--space-2);

    color:
      var(--primary);
  }


  @media (
    max-width: 640px
  ) {

    .viz-header {
      align-items:
        start;

      flex-direction:
        column;
    }


    .difficulty-legend {
      align-items:
        center;
    }

  }
</style>

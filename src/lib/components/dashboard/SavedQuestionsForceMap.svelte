<script>
  import {
    onMount
  } from 'svelte';

  import {
    forceSimulation,
    forceX,
    forceY,
    forceCollide,
    forceManyBody
  } from 'd3-force';


  let {
    questions = [],
    selectedId = null,
    onSelect = () => {}
  } = $props();


  const WIDTH =
    920;

  const HEIGHT =
    330;

  const EDGE =
    28;

  const MIN_RADIUS =
    10;

  const MAX_RADIUS =
    25;

  const DEFAULT_DIFFICULTY =
    0.5;


  let nodes =
    $state([]);

  let clusters =
    $state([]);

  let hoveredId =
    $state(null);


  function getQuestionId(
    question
  ) {
    return (
      question.question_id ??
      question.id
    );
  }


  function getQuestionText(
    question
  ) {
    return (
      question.question_text ??
      question.text ??
      question.t ??
      'Question'
    );
  }


  function getTopic(
    question
  ) {
    return (
      question.topic ??
      question.s ??
      '—'
    );
  }


  function getModule(
    question
  ) {
    return (
      question.module ??
      question.m ??
      'Other'
    );
  }


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
    return (
      MIN_RADIUS +
      difficultyValue(node) *
        (
          MAX_RADIUS -
          MIN_RADIUS
        )
    );
  }


  function difficultyLabel(
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


  function makeClusterAnchors(
    moduleNames
  ) {
    const count =
      moduleNames.length;


    if (count === 0) {
      return [];
    }


    if (count === 1) {
      return [
        {
          module:
            moduleNames[0],

          x:
            WIDTH / 2,

          y:
            HEIGHT / 2
        }
      ];
    }


    const radiusX =
      Math.min(
        WIDTH * 0.34,
        300
      );

    const radiusY =
      Math.min(
        HEIGHT * 0.27,
        82
      );


    return moduleNames.map(
      (
        module,
        index
      ) => {

        const angle =
          -Math.PI / 2 +
          (
            index /
            count
          ) *
          Math.PI *
          2;


        return {
          module,

          x:
            WIDTH / 2 +
            Math.cos(
              angle
            ) *
            radiusX,

          y:
            HEIGHT / 2 +
            Math.sin(
              angle
            ) *
            radiusY
        };
      }
    );
  }


  function selectedNode() {
    return nodes.find(
      (node) =>
        getQuestionId(
          node
        ) ===
        selectedId
    );
  }


  function activeNode() {
    const hovered =
      nodes.find(
        (node) =>
          getQuestionId(
            node
          ) ===
          hoveredId
      );

    return (
      hovered ??
      selectedNode()
    );
  }


  function chooseNode(
    node
  ) {
    const id =
      getQuestionId(
        node
      );


    selectedId =
      id;


    onSelect(
      id,
      node
    );
  }


  function openNode(
    node
  ) {
    const id =
      getQuestionId(
        node
      );


    if (!id) {
      return;
    }


    window.location.href =
      `/student/saved/${encodeURIComponent(id)}`;
  }


  onMount(() => {

    if (
      questions.length === 0
    ) {
      return;
    }


    const modules =
      [
        ...new Set(
          questions.map(
            getModule
          )
        )
      ];


    clusters =
      makeClusterAnchors(
        modules
      );


    const anchorMap =
      new Map(
        clusters.map(
          (cluster) => [
            cluster.module,
            cluster
          ]
        )
      );


    const simulationNodes =
      questions.map(
        (question) => {

          const module =
            getModule(
              question
            );


          const anchor =
            anchorMap.get(
              module
            ) ??
            {
              x:
                WIDTH / 2,

              y:
                HEIGHT / 2
            };


          return {
            ...question,

            x:
              anchor.x +
              (
                Math.random() -
                0.5
              ) *
              90,

            y:
              anchor.y +
              (
                Math.random() -
                0.5
              ) *
              70
          };
        }
      );


    nodes =
      [
        ...simulationNodes
      ];


    const simulation =
      forceSimulation(
        simulationNodes
      )

        .force(
          'x',

          forceX(
            (node) => {
              const anchor =
                anchorMap.get(
                  getModule(
                    node
                  )
                );

              return (
                anchor?.x ??
                WIDTH / 2
              );
            }
          )
            .strength(
              0.085
            )
        )

        .force(
          'y',

          forceY(
            (node) => {
              const anchor =
                anchorMap.get(
                  getModule(
                    node
                  )
                );

              return (
                anchor?.y ??
                HEIGHT / 2
              );
            }
          )
            .strength(
              0.085
            )
        )

        .force(
          'collision',

          forceCollide(
            (node) =>
              nodeRadius(
                node
              ) +
              5
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
              -8
            )
        )

        .velocityDecay(
          0.24
        )

        .alphaDecay(
          0.03
        )

        .on(
          'tick',
          () => {

            for (
              const node of
              simulationNodes
            ) {

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


            nodes =
              [
                ...simulationNodes
              ];
          }
        );


    return () => {
      simulation.stop();
    };
  });
</script>


<section class="saved-map">

  <header class="map-header">

    <div>

      <p class="map-eyebrow">
        Personal collection
      </p>

      <h2>
        Saved question map
      </h2>

    </div>


    <div class="map-summary">

      <strong>
        {questions.length}
      </strong>

      <span>
        saved
      </span>

    </div>

  </header>


  {#if questions.length === 0}

    <div class="empty-map">

      <span>
        Bookmark questions to build your map.
      </span>

    </div>

  {:else}

    <div class="map-frame">

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}

        role="img"

        aria-label="Saved questions grouped by main topic. Circle radius represents difficulty."
      >

        <defs>

          <radialGradient
            id="saved-node-gradient"

            cx="50%"
            cy="12%"
            r="92%"

            fx="50%"
            fy="8%"
          >

            <stop
              offset="0%"
              stop-color="var(--viz-spectrum-1)"
              stop-opacity="0.96"
            />

            <stop
              offset="28%"
              stop-color="var(--viz-spectrum-2)"
              stop-opacity="0.92"
            />

            <stop
              offset="52%"
              stop-color="var(--viz-spectrum-3)"
              stop-opacity="0.88"
            />

            <stop
              offset="76%"
              stop-color="var(--viz-spectrum-4)"
              stop-opacity="0.84"
            />

            <stop
              offset="100%"
              stop-color="var(--viz-spectrum-5)"
              stop-opacity="0.78"
            />

          </radialGradient>

        </defs>


        {#each clusters as cluster (cluster.module)}

          <g
            class="cluster-label"
            transform={`translate(${cluster.x} ${cluster.y})`}
            aria-hidden="true"
          >

            <text
              text-anchor="middle"
              y="-46"
            >
              {cluster.module}
            </text>

          </g>

        {/each}


        {#each nodes as node, nodeIndex (getQuestionId(node))}

          <circle
            class="saved-node"

            class:selected={
              getQuestionId(node) ===
              selectedId
            }

            class:hovered={
              getQuestionId(node) ===
              hoveredId
            }

            cx={node.x}
            cy={node.y}

            r={
              nodeRadius(
                node
              )
            }

            fill="url(#saved-node-gradient)"

            style={`--saved-node-delay: ${Math.min(520, nodeIndex * 18)}ms`}

            tabindex="0"

            role="button"

            aria-label={`${getQuestionText(node)}. ${getModule(node)}. ${getTopic(node)}. Difficulty ${difficultyLabel(node)}.`}

            onclick={() => {
              chooseNode(
                node
              );
            }}

            ondblclick={() => {
              openNode(
                node
              );
            }}

            onmouseenter={() => {
              hoveredId =
                getQuestionId(
                  node
                );
            }}

            onmouseleave={() => {
              hoveredId =
                null;
            }}

            onfocus={() => {
              hoveredId =
                getQuestionId(
                  node
                );
            }}

            onblur={() => {
              hoveredId =
                null;
            }}

            onkeydown={(event) => {

              if (
                event.key ===
                'Enter'
              ) {
                chooseNode(
                  node
                );
              }


              if (
                event.key ===
                ' '
              ) {
                event.preventDefault();

                chooseNode(
                  node
                );
              }
            }}
          >

            <title>
              {getQuestionText(node)}
              · {getModule(node)}
              · {getTopic(node)}
              · Difficulty {difficultyLabel(node)}
            </title>

          </circle>

        {/each}

      </svg>

    </div>


    {@const active = activeNode()}

    <div
      class="map-inspector"
      aria-live="polite"
    >

      {#if active}

        <div class="inspector-copy">

          <span class="inspector-meta">
            {getModule(active)}
            /
            {getTopic(active)}
            /
            Difficulty {difficultyLabel(active)}
          </span>

          <strong>
            {getQuestionText(active)}
          </strong>

        </div>


        <span class="inspector-hint">
          Click to locate · Double-click to open
        </span>

      {:else}

        <span class="inspector-hint">
          Select a node to locate its saved question.
        </span>

      {/if}

    </div>

  {/if}

</section>


<style>
  .saved-map {
    display:
      grid;

    gap:
      var(--space-4);
  }


  .map-header {
    display:
      flex;

    align-items:
      end;

    justify-content:
      space-between;

    gap:
      var(--space-4);
  }


  .map-eyebrow {
    margin:
      0 0
      var(--space-1);

    color:
      var(--text-muted);

    text-transform:
      uppercase;

    letter-spacing:
      0.08em;
  }


  .map-header h2 {
    margin:
      0;
  }


  .map-summary {
    display:
      flex;

    align-items:
      baseline;

    gap:
      var(--space-2);

    color:
      var(--text-muted);
  }


  .map-summary strong {
    color:
      var(--primary);

    font-variant-numeric:
      tabular-nums;
  }


  .map-frame {
    overflow:
      hidden;

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

    min-height:
      280px;
  }


  .cluster-label text {
    fill:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.72
      );

    letter-spacing:
      0.08em;
  }


  .saved-node {
    cursor:
      pointer;

    stroke:
      var(--border);

    stroke-width:
      1;

    transition:
      stroke-width
      120ms
      ease,
      opacity
      120ms
      ease;

    transform-box:
      fill-box;

    transform-origin:
      center;

    animation:
      saved-node-in
      440ms
      cubic-bezier(0.2, 0.85, 0.25, 1.1)
      both;

    animation-delay:
      var(--saved-node-delay, 0ms);
  }


  @keyframes saved-node-in {
    from {
      opacity:
        0;

      transform:
        scale(0.45);
    }

    75% {
      transform:
        scale(1.06);
    }

    to {
      opacity:
        1;

      transform:
        scale(1);
    }
  }


  .saved-node:hover,
  .saved-node.hovered {
    stroke:
      var(--text);

    stroke-width:
      2;
  }


  .saved-node.selected {
    stroke:
      var(--primary);

    stroke-width:
      3;
  }


  .saved-node:focus-visible {
    outline:
      none;

    stroke:
      var(--primary);

    stroke-width:
      3;
  }


  .map-inspector {
    min-height:
      52px;

    display:
      flex;

    align-items:
      center;

    justify-content:
      space-between;

    gap:
      var(--space-4);

    padding:
      var(--space-3) 0;

    border-bottom:
      1px solid
      var(--border-soft);
  }


  .inspector-copy {
    min-width:
      0;

    display:
      grid;

    gap:
      var(--space-1);
  }


  .inspector-copy strong {
    overflow:
      hidden;

    text-overflow:
      ellipsis;

    white-space:
      nowrap;
  }


  .inspector-meta,
  .inspector-hint {
    color:
      var(--text-muted);

    font-size:
      calc(
        var(--font-size-base) *
        0.78
      );
  }


  .inspector-hint {
    flex:
      0 0 auto;
  }


  .empty-map {
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

    .map-header,
    .map-inspector {
      align-items:
        flex-start;

      flex-direction:
        column;
    }


    .inspector-hint {
      flex:
        0 1 auto;
    }

  }


  @media (
    prefers-reduced-motion: reduce
  ) {

    .saved-node {
      animation:
        none;

      transition:
        none;
    }

  }
</style>

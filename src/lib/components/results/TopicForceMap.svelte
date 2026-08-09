<script>
  import { onMount } from 'svelte';

  import {
    forceSimulation,
    forceCenter,
    forceCollide,
    forceManyBody,
    forceX,
    forceY
  } from 'd3-force';

  import { drag } from 'd3-drag';
  import { select } from 'd3-selection';


  let {
    topics = []
  } = $props();


  let container;
  let svgElement;

  let width = $state(700);
  const height = 420;

  let nodes = $state([]);

  let selectedId = $state(null);
  let draggingId = $state(null);

  let simulation;


  const selectedTopic =
    $derived(
      topics.find(
        (topic) =>
          topic.id === selectedId
      ) ?? null
    );


  function shortLabel(value) {
    if (!value) {
      return '';
    }

    if (value.length <= 18) {
      return value;
    }

    return (
      value.slice(0, 16) +
      '…'
    );
  }


  function syncNodes() {
    if (!simulation) {
      return;
    }

    /*
      Important:
      the simulation owns the real node objects.

      Svelte receives copies only for rendering.
    */
    nodes =
      simulation
        .nodes()
        .map(
          (node) => ({
            ...node
          })
        );
  }


  function buildSimulation() {
    simulation?.stop();


    if (
      topics.length === 0
    ) {
      nodes = [];

      return;
    }


    const maximum =
      Math.max(
        ...topics.map(
          (topic) =>
            topic.total
        ),
        1
      );


    const nextNodes =
      topics.map(
        (
          topic,
          index
        ) => {

          const angle =
            index *
            2.399963229728653;

          const distance =
            Math.sqrt(index) *
            22;


          return {
            ...topic,

            radius:
              20 +
              Math.sqrt(
                topic.total /
                  maximum
              ) *
                30,

            x:
              width / 2 +
              Math.cos(angle) *
                distance,

            y:
              height / 2 +
              Math.sin(angle) *
                distance,

            vx: 0,

            vy: 0
          };
        }
      );


    simulation =
      forceSimulation(
        nextNodes
      )

        /*
          Soft gravitational pull
          toward the middle.
        */
        .force(
          'x',
          forceX(
            width / 2
          ).strength(0.035)
        )

        .force(
          'y',
          forceY(
            height / 2
          ).strength(0.045)
        )

        /*
          Mild particle repulsion.

          This makes displacement from
          dragging travel through the
          surrounding bubbles.
        */
        .force(
          'charge',
          forceManyBody()
            .strength(-8)
        )

        /*
          Nodes cannot overlap.
        */
        .force(
          'collision',
          forceCollide(
            (node) =>
              node.radius + 5
          )
            .strength(0.9)
            .iterations(3)
        )

        /*
          Keeps the whole arrangement
          approximately centered.
        */
        .force(
          'center',
          forceCenter(
            width / 2,
            height / 2
          )
        )

        /*
          Lower velocity decay =
          slightly more physical motion.
        */
        .velocityDecay(0.28)

        .alpha(1)

        .alphaDecay(0.025)

        .on(
          'tick',
          syncNodes
        );


    syncNodes();
  }


  function installDrag() {
    if (
      !svgElement
    ) {
      return;
    }


    const behaviour =
      drag()

        /*
          SVG itself establishes the
          coordinate system used by
          event.x / event.y.
        */
        .container(
          () => svgElement
        )

        /*
          Don't accidentally begin a drag
          far away from every circle.

          simulation.find gives us the
          actual simulation-owned node.
        */
        .subject(
          (event) => {

            if (!simulation) {
              return null;
            }


            return (
              simulation.find(
                event.x,
                event.y,
                65
              ) ?? null
            );
          }
        )

        /*
          Small movements are still clicks.
        */
        .clickDistance(4)

        .on(
          'start',
          (event) => {

            if (
              !event.subject ||
              !simulation
            ) {
              return;
            }


            draggingId =
              event.subject.id;


            selectedId =
              event.subject.id;


            /*
              Wake up the whole system.

              Without this, the force
              simulation may already have
              cooled to almost zero.
            */
            if (!event.active) {
              simulation
                .alphaTarget(0.28)
                .restart();
            }


            /*
              Pin this particle to its
              current position.
            */
            event.subject.fx =
              event.subject.x;

            event.subject.fy =
              event.subject.y;
          }
        )

        .on(
          'drag',
          (event) => {

            if (
              !event.subject
            ) {
              return;
            }


            /*
              The dragged bubble follows
              the pointer.

              The collision force causes
              the OTHER bubbles to move.
            */
            event.subject.fx =
              event.x;

            event.subject.fy =
              event.y;
          }
        )

        .on(
          'end',
          (event) => {

            if (
              !event.subject ||
              !simulation
            ) {
              return;
            }


            draggingId =
              null;


            /*
              Allow the system to cool
              naturally again.
            */
            if (!event.active) {
              simulation
                .alphaTarget(0);
            }


            /*
              Release the particle.

              This is what gives the
              satisfying elastic
              settle-back motion.
            */
            event.subject.fx =
              null;

            event.subject.fy =
              null;


            /*
              Give it another small burst
              of energy on release.
            */
            simulation
              .alpha(
                Math.max(
                  simulation.alpha(),
                  0.35
                )
              )
              .restart();
          }
        );


    select(svgElement)
      .call(behaviour);
  }


  onMount(() => {

    const observer =
      new ResizeObserver(
        ([entry]) => {

          const nextWidth =
            Math.max(
              320,
              Math.floor(
                entry
                  .contentRect
                  .width
              )
            );


          if (
            nextWidth === width
          ) {
            return;
          }


          width =
            nextWidth;

          buildSimulation();
        }
      );


    observer.observe(
      container
    );


    buildSimulation();

    installDrag();


    return () => {
      observer.disconnect();

      simulation?.stop();

      if (svgElement) {
        select(svgElement)
          .on('.drag', null);
      }
    };
  });
</script>


<div
  class="topic-force"
  bind:this={container}
>

  {#if topics.length === 0}

    <p class="empty">
      No topic data available.
    </p>

  {:else}
  <div class="score-legend">

  <span>
    0%
  </span>


  <div
    class="score-gradient"
    aria-hidden="true"
  ></div>


  <span>
    100%
  </span>

</div>

    <svg
      bind:this={svgElement}

      viewBox={`0 0 ${width} ${height}`}

      role="img"

      aria-label="Interactive topic distribution. Drag topics to explore the force layout."
    >

      {#each
        nodes as node
        (node.id)
      }

        <g
          class="bubble"

          class:selected={
            selectedId ===
            node.id
          }

          class:dragging={
            draggingId ===
            node.id
          }

          transform={`translate(${node.x}, ${node.y})`}
        >

          <circle
  class="topic-node"
  r={node.radius}
  style:fill={`color-mix(
    in srgb,
    var(--gold) ${100 - node.accuracy}%,
    var(--verdigris) ${node.accuracy}%
  )`}
/>
            <title>
              {node.topic}
              · {node.total} questions
              · {Math.round(
                node.accuracy
              )}% accuracy
            </title>
          


          <text
            class="topic-label"
            text-anchor="middle"
            y="-2"
          >
            {shortLabel(
              node.topic
            )}
          </text>


          <text
  class="topic-score"
  text-anchor="middle"
  y="17"
>
  {Math.round(
    node.accuracy
  )}%
</text>

        </g>

      {/each}

    </svg>


    {#if selectedTopic}

      <div class="topic-detail">

  <div>
    <span>
      Section
    </span>

    <strong>
      {selectedTopic.topic}
    </strong>
  </div>


  <div>
    <span>
      Module
    </span>

    <strong>
      {selectedTopic.module}
    </strong>
  </div>


  <div>
    <span>
      Questions
    </span>

    <strong>
      {selectedTopic.total}
    </strong>
  </div>


  <div>
    <span>
      Correct
    </span>

    <strong>
      {selectedTopic.correct}
    </strong>
  </div>


  <div>
    <span>
      Wrong
    </span>

    <strong>
      {selectedTopic.wrong}
    </strong>
  </div>


  <div>
    <span>
      Score
    </span>

    <strong>
      {Math.round(
        selectedTopic.accuracy
      )}%
    </strong>
  </div>

</div>

    {/if}

  {/if}

</div>


<style>
.score-legend {
  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: var(--space-2);

  color:
    var(--text-muted);

  font-size:
    10px;
}


.score-gradient {
  width: 120px;

  height: 3px;

  background-image:
  var(--verdigris-gold);
}
.topic-score {
  fill:
    var(--text);

  font-size:
    12px;

  font-weight: 700;

  pointer-events: none;

  user-select: none;
}


.topic-label {
  fill:
    var(--text);

  font-size:
    10px;

  pointer-events: none;

  user-select: none;
}
  .topic-force {
    width: 100%;

    overflow: hidden;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      1px solid
      var(--border-soft);
  }


  svg {
    display: block;

    width: 100%;

    height: 420px;

    overflow: hidden;

    /*
      Essential for touch dragging.
    */
    touch-action: none;

    cursor: grab;

    user-select: none;
  }


  svg:active {
    cursor: grabbing;
  }


  .bubble {
    cursor: grab;
  }


  .bubble.dragging {
    cursor: grabbing;
  }


.topic-node {
  fill:
    var(--viz-score-low);

  stroke:
    var(--border);

  stroke-width: 1;

  opacity: 1;
}


  .bubble:hover
    .topic-node {
    stroke:
      var(--primary);
  }


  .bubble.selected
    .topic-node {
    stroke:
      var(--text);

    stroke-width: 2;
  }


  .bubble.dragging
    .topic-node {
    stroke:
      var(--text);

    stroke-width: 2;
  }


  .topic-label {
    fill:
      var(--text);

    font-size: 10px;

    pointer-events: none;

    user-select: none;
  }


  .topic-meta {
    fill:
      var(--text-muted);

    font-size: 9px;

    pointer-events: none;

    user-select: none;
  }


 .topic-detail {
  display: grid;

  grid-template-columns:
    repeat(
      6,
      minmax(0, 1fr)
    );

  border-top:
    1px solid
    var(--border-soft);
}


  .topic-detail > div {
    min-width: 0;

    display: grid;

    gap:
      var(--space-1);

    padding:
      var(--space-3);

    border-right:
      1px solid
      var(--border-soft);
  }


  .topic-detail > div:last-child {
    border-right: 0;
  }


  .topic-detail span {
    color:
      var(--text-muted);

    font-size: 10px;

    text-transform:
      uppercase;
  }


  .topic-detail strong {
    overflow-wrap:
      anywhere;

    font-size: 12px;
  }


  .empty {
    padding:
      var(--space-5)
      0;

    color:
      var(--text-muted);
  }


  @media (
    max-width: 640px
  ) {

    svg {
      height: 360px;
    }


    .topic-detail {
      grid-template-columns:
        repeat(
          2,
          1fr
        );
    }

  }
</style>
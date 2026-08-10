<script>
  import { onMount } from "svelte";

  import {
    forceSimulation,
    forceX,
    forceY,
    forceCollide,
    forceManyBody,
  } from "d3-force";

  import { drag } from "d3-drag";
  import { select } from "d3-selection";

  let { questions = [] } = $props();

  const WIDTH = 920;
  const HEIGHT = 500;

  let svgElement;

  function nodeRadius(node) {
    const radiusByBox = {
      1: 8,
      2: 12,
      3: 16,
      4: 21,
      5: 27,
    };

    return radiusByBox[Number(node.box)] ?? 8;
  }

  let nodes = $state(
    questions.map((question, index) => ({
      ...question,
      box: Number(question.box),
      x: WIDTH / 2 + ((index % 11) - 5) * 4,
      y: HEIGHT / 2 + ((Math.floor(index / 11) % 11) - 5) * 4,
    })),
  );

  onMount(() => {
    const simulation = forceSimulation(nodes)
      .force(
        "x",
        forceX(WIDTH / 2).strength(0.035),
      )
      .force(
        "y",
        forceY(HEIGHT / 2).strength(0.045),
      )
      .force(
        "collision",
        forceCollide((node) => nodeRadius(node) + 4)
          .strength(1)
          .iterations(4),
      )
      .force(
        "charge",
        forceManyBody().strength(-12),
      )
      .velocityDecay(0.26)
      .alphaDecay(0.025)
      .on("tick", () => {
        for (const node of nodes) {
          const radius = nodeRadius(node) + 2;

          node.x = Math.max(
            radius,
            Math.min(WIDTH - radius, node.x),
          );

          node.y = Math.max(
            radius,
            Math.min(HEIGHT - radius, node.y),
          );
        }

        // D3 mutates node coordinates. Reassign so Svelte repaints them.
        nodes = [...nodes];
      });

    const nodeSelection = select(svgElement).selectAll(".leitner-node");

    nodeSelection.call(
      drag()
        .subject((event) => simulation.find(event.x, event.y, 50))
        .on("start", (event) => {
          if (!event.active) {
            simulation.alphaTarget(0.28).restart();
          }

          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }

          event.subject.fx = null;
          event.subject.fy = null;

          simulation
            .alpha(Math.max(simulation.alpha(), 0.35))
            .restart();
        }),
    );

    return () => {
      simulation.stop();
    };
  });
</script>

<section class="leitner-viz">
  <header class="viz-header">
    <div>
      <p class="viz-eyebrow">Revision state</p>
      <h2>Leitner distribution</h2>
    </div>

    <div class="viz-summary">
      <strong>{questions.length}</strong>
      <span>learned questions</span>
    </div>
  </header>

  <div class="chart-frame">
    <svg
      bind:this={svgElement}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Leitner question cloud. Circle radius represents Leitner box number; outlined circles are due now."
    >
      <defs>
        <radialGradient
          id="leitner-node-gradient"
          cx="50%"
          cy="0%"
          r="100%"
          fx="50%"
          fy="0%"
        >
          <stop
            offset="0%"
            stop-color="var(--viz-leitner-inner)"
          />

          <stop
            offset="45%"
            stop-color="var(--viz-leitner-middle)"
          />

          <stop
            offset="100%"
            stop-color="var(--viz-leitner-outer)"
          />
        </radialGradient>
      </defs>

      {#each nodes as node (node.id)}
        <circle
          class="leitner-node"
          class:due={node.due}
          cx={node.x}
          cy={node.y}
          r={nodeRadius(node)}
          fill="url(#leitner-node-gradient)"
        >
          <title>
            Box {node.box}
            {node.module ? ` · ${node.module}` : ""}
            {node.topic ? ` · ${node.topic}` : ""}
            {node.due ? " · Due now" : ""}
          </title>
        </circle>

        <text
          class="leitner-node-label"
          x={node.x}
          y={node.y}
          text-anchor="middle"
          dominant-baseline="central"
        >
          {node.box}
        </text>
      {/each}
    </svg>
  </div>

  <footer class="viz-legend">
    <span>Radius: Box 1 → Box 5</span>
    <span class="due-key">Outlined: Due now</span>
    <span>Drag a question to disturb the cloud</span>
  </footer>
</section>

<style>
  .leitner-viz {
    display: grid;
    gap: var(--space-4);
  }

  .viz-header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: var(--space-4);
  }

  .viz-eyebrow {
    margin: 0 0 var(--space-1);
    color: var(--text-muted);
  }

  .viz-header h2 {
    margin: 0;
  }

  .viz-summary {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    color: var(--text-muted);
  }

  .viz-summary strong {
    color: var(--text);
  }

  .chart-frame {
    overflow: hidden;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  svg {
    display: block;
    width: 100%;
    touch-action: none;
  }

  .leitner-node {
    cursor: grab;
  }

  .leitner-node:active {
    cursor: grabbing;
  }

  .leitner-node.due {
    stroke: var(--primary);
    stroke-width: 2;
  }

  .leitner-node-label {
    fill: var(--text);
    font-size: 9px;
    font-weight: 700;
    pointer-events: none;
    user-select: none;
  }

  .viz-legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    color: var(--text-muted);
  }

  .due-key {
    color: var(--primary);
  }
</style>

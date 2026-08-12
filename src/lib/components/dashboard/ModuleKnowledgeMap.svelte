<script>
  let {
    questions = []
  } = $props();

  const LEVELS = [5, 4, 3, 2, 1];

  const moduleNameCollator =
    new Intl.Collator("en", {
      numeric: true,
      sensitivity: "base"
    });

  const modules =
    $derived.by(
      () => {
        const grouped = new Map();

        for (const question of questions) {
          const name =
            String(
              question.module ??
              "Unassigned"
            ).trim() ||
            "Unassigned";

          if (!grouped.has(name)) {
            grouped.set(name, {
              name,
              total: 0,
              weightedLevel: 0,
              levels: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
              }
            });
          }

          const module = grouped.get(name);
          const level =
            Math.min(
              5,
              Math.max(
                1,
                Number(question.box) || 1
              )
            );

          module.total += 1;
          module.levels[level] += 1;
          module.weightedLevel += level;
        }

        return [...grouped.values()]
          .map((module) => ({
            ...module,
            knowledge:
              module.total > 0
                ? module.weightedLevel /
                  module.total
                : 0
          }))
          .sort(
            (first, second) =>
              moduleNameCollator.compare(
                first.name,
                second.name
              )
          );
      }
    );

  const maximumCellCount =
    $derived(
      Math.max(
        1,
        ...modules.flatMap(
          (module) =>
            LEVELS.map(
              (level) =>
                module.levels[level]
            )
        )
      )
    );

  const averageKnowledge =
    $derived.by(
      () => {
        const totalQuestions =
          modules.reduce(
            (total, module) =>
              total + module.total,
            0
          );

        return totalQuestions > 0
          ? modules.reduce(
              (total, module) =>
                total + module.weightedLevel,
              0
            ) / totalQuestions
          : 0;
      }
    );

  function bubbleSize(count) {
    return count === 0
      ? 5
      : Math.round(
          10 +
          Math.sqrt(
            count / maximumCellCount
          ) * 22
        );
  }
</script>

<section
  class="knowledge-map"
  aria-labelledby="knowledge-heading"
>
  <header class="knowledge-heading">
    <div>
      <p>Module × knowledge level</p>
      <h2 id="knowledge-heading">Knowledge distribution</h2>
    </div>

    <div class="knowledge-summary">
      <strong>{averageKnowledge.toFixed(1)}</strong>
      <span>average / 5</span>
    </div>
  </header>

  {#if modules.length === 0}
    <div class="knowledge-empty">
      Complete an examination to build this map.
    </div>
  {:else}
    <div class="matrix-scroll">
      <div
        class="matrix"
        style={`--module-count: ${modules.length}`}
      >
        <div class="level-axis" aria-hidden="true">
          {#each LEVELS as level}
            <span>
              <strong>{level}</strong>
              <small>{level === 5 ? "Strong" : level === 1 ? "Starting" : ""}</small>
            </span>
          {/each}
        </div>

        <div class="module-grid">
          {#each modules as module, moduleIndex (module.name)}
            <div class="module-column">
              <div class="level-cells">
                {#each LEVELS as level, levelIndex}
                  {@const count = module.levels[level]}
                  <div
                    class:occupied={count > 0}
                    class="level-cell"
                    title={`${module.name}: ${count} questions at level ${level}`}
                  >
                    <i
                      aria-hidden="true"
                      style={`--bubble-size: ${bubbleSize(count)}px; --bubble-delay: ${moduleIndex * 42 + levelIndex * 24}ms`}
                    ></i>

                    {#if count > 0}
                      <span>{count}</span>
                    {/if}
                  </div>
                {/each}
              </div>

              <div class="module-label">
                <strong>{module.name}</strong>
                <span
                  title={`${module.total} learned questions, average level ${module.knowledge.toFixed(1)}`}
                >
                  {module.total} · L{module.knowledge.toFixed(1)}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <p class="knowledge-note">
      Higher spheres indicate stronger recall; size represents question count.
    </p>

    <ul class="sr-only">
      {#each modules as module (module.name)}
        <li>
          {module.name}: {module.total} learned questions, average level {module.knowledge.toFixed(1)} out of 5.
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .knowledge-map {
    min-width: 0;
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-6);
    padding-block: var(--space-4) var(--space-3);
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  .knowledge-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .knowledge-heading p,
  .knowledge-heading h2,
  .knowledge-note {
    margin: 0;
  }

  .knowledge-heading p {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: calc(var(--font-size-base) * 0.72);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .knowledge-heading h2 {
    margin-top: var(--space-1);
    color: var(--text);
    font-family: var(--font-heading);
    font-size: calc(var(--font-size-base) * 1.28);
    font-weight: 600;
  }

  .knowledge-summary {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: calc(var(--font-size-base) * 0.7);
    white-space: nowrap;
  }

  .knowledge-summary strong {
    color: var(--primary);
    font-family: var(--font-heading);
    font-size: calc(var(--font-size-base) * 1.35);
    font-weight: 600;
  }

  .matrix-scroll {
    min-width: 0;
    overflow-x: hidden;
    color-scheme: dark;
    scrollbar-color:
      var(--viz-spectrum-4)
      color-mix(in srgb, var(--surface-strong) 88%, transparent);
    scrollbar-width: thin;
  }

  .matrix-scroll::-webkit-scrollbar {
    height: 7px;
  }

  .matrix-scroll::-webkit-scrollbar-track {
    background:
      color-mix(
        in srgb,
        var(--surface-strong) 88%,
        transparent
      );
    border-radius: 999px;
  }

  .matrix-scroll::-webkit-scrollbar-thumb {
    background:
      linear-gradient(
        90deg,
        var(--viz-spectrum-1),
        var(--viz-spectrum-3),
        var(--viz-spectrum-5)
      );
    border: 1px solid var(--bg);
    border-radius: 999px;
  }

  .matrix-scroll::-webkit-scrollbar-thumb:hover {
    background:
      linear-gradient(
        90deg,
        var(--gold),
        var(--verdigris)
      );
  }

  .matrix-scroll::-webkit-scrollbar-button,
  .matrix-scroll::-webkit-scrollbar-corner {
    width: 0;
    height: 0;
    display: none;
    background: transparent;
  }

  .matrix {
    min-width: 100%;
    display: grid;
    grid-template-columns: 50px minmax(0, 1fr);
    gap: var(--space-2);
  }

  .level-axis,
  .level-cells {
    height: 160px;
    display: grid;
    grid-template-rows: repeat(5, 1fr);
  }

  .level-axis span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-muted);
    border-bottom: 1px dotted var(--border-soft);
    font-family: var(--font-metadata);
  }

  .level-axis strong {
    color: var(--text);
    font-size: calc(var(--font-size-base) * 0.76);
  }

  .level-axis small {
    font-size: 8px;
    text-transform: uppercase;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(var(--module-count), minmax(0, 1fr));
  }

  .module-column {
    min-width: 0;
    display: grid;
    grid-template-rows: 160px auto;
  }

  .level-cell {
    position: relative;
    display: grid;
    place-items: center;
    border-bottom: 1px dotted var(--border-soft);
  }

  .level-cell i {
    width: var(--bubble-size);
    aspect-ratio: 1;
    display: block;
    background: color-mix(in srgb, var(--border-soft) 48%, transparent);
    border-radius: 50%;
  }

  .level-cell.occupied i {
    background:
      radial-gradient(
        circle at 28% 24%,
        var(--viz-spectrum-1),
        var(--viz-spectrum-3) 48%,
        var(--viz-spectrum-5)
      );
    border: 1px solid color-mix(in srgb, var(--viz-spectrum-2) 70%, white);
    animation:
      knowledge-bubble-in
      520ms
      cubic-bezier(0.2, 0.8, 0.2, 1)
      both;
    animation-delay: var(--bubble-delay, 0ms);
  }

  .level-cell span {
    position: absolute;
    color: var(--primary-text);
    font-family: var(--font-metadata);
    font-size: 8px;
    font-weight: 700;
  }

  .module-label {
    min-width: 0;
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: var(--space-2) var(--space-1) 0;
    text-align: center;
  }

  .module-label strong {
    max-width: 100%;
    overflow: hidden;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: calc(var(--font-size-base) * 0.72);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .module-label span,
  .knowledge-note,
  .knowledge-empty {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: calc(var(--font-size-base) * 0.64);
  }

  .module-label span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes knowledge-bubble-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.2);
    }

    72% {
      opacity: 1;
      transform: translateY(-1px) scale(1.08);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .knowledge-note,
  .knowledge-empty {
    text-align: center;
  }

  .knowledge-empty {
    min-height: 120px;
    display: grid;
    place-items: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 600px) {
    .matrix-scroll {
      overflow-x: auto;
      scrollbar-width: thin;
    }

    .matrix {
      min-width: max(100%, calc(50px + var(--module-count) * 64px));
    }

    .module-grid {
      grid-template-columns: repeat(var(--module-count), minmax(64px, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .level-cell.occupied i {
      animation: none;
    }
  }
</style>

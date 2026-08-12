<script>
  let {
    streak = {
      current: 0,
      longest: 0,
      recentDays: []
    },
    compact = false
  } = $props();

  const MAX_VISIBLE_ATTEMPTS = 5;

  const days =
    $derived(
      (streak.recentDays ?? [])
        .slice(-7)
        .map(
          (day) => ({
            ...day,
            attemptCount:
              Math.max(
                0,
                Number(
                  day.attemptCount ??
                  (day.active ? 1 : 0)
                ) || 0
              )
          })
        )
    );

  const weekAttempts =
    $derived(
      days.reduce(
        (total, day) =>
          total + day.attemptCount,
        0
      )
    );

  function shortDate(
    dateKey
  ) {
    if (!dateKey) {
      return "";
    }

    const [, month, day] =
      dateKey.split("-");

    return `${day}/${month}`;
  }
</script>

<section
  class:compact
  class="rhythm"
  aria-labelledby="rhythm-heading"
>
  <header class="rhythm-heading">
    <div>
      <p>Seven-day momentum</p>
      <h2 id="rhythm-heading">Study rhythm</h2>
    </div>

    <div class="rhythm-summary">
      <span>
        <strong>{streak.current ?? 0}</strong>
        {compact ? "streak" : "day streak"}
      </span>

      <span>
        <strong>{weekAttempts}</strong>
        {compact ? "attempts" : "attempts this week"}
      </span>
    </div>
  </header>

  <div
    class="equalizer"
    role="img"
    aria-label={`Seven-day study activity. ${streak.current ?? 0} day streak and ${weekAttempts} attempts this week.`}
  >
    {#each days as day (day.dateKey)}
      <div
        class:today={day.isToday}
        class="day-column"
        title={`${day.dateKey}: ${day.attemptCount} ${day.attemptCount === 1 ? "attempt" : "attempts"}`}
      >
        <div class="sphere-stack" aria-hidden="true">
          {#if day.attemptCount === 0}
            <i class="sphere empty"></i>
          {:else}
            {#each Array(Math.min(day.attemptCount, MAX_VISIBLE_ATTEMPTS)) as _, sphereIndex}
              <i
                class:base={sphereIndex === 0}
                class="sphere filled"
              ></i>
            {/each}

            {#if day.attemptCount > MAX_VISIBLE_ATTEMPTS}
              <span class="overflow-count">
                +{day.attemptCount - MAX_VISIBLE_ATTEMPTS}
              </span>
            {/if}
          {/if}
        </div>

        <div class="day-label">
          <strong>{day.label}</strong>
          <span>{shortDate(day.dateKey)}</span>
        </div>

        <span class="sr-only">
          {day.dateKey}, {day.attemptCount} {day.attemptCount === 1 ? "attempt" : "attempts"}
        </span>
      </div>
    {/each}
  </div>

  <p class="rhythm-note">
    {compact
      ? "Sphere = examination · active day = streak day."
      : "Each sphere is one completed examination. Consecutive active days build your streak."}
  </p>
</section>

<style>
  .rhythm {
    display: grid;
    gap: var(--space-4);
    margin-top: var(--space-6);
    padding-block: var(--space-4) var(--space-3);
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  .rhythm-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .rhythm-heading p,
  .rhythm-heading h2,
  .rhythm-note {
    margin: 0;
  }

  .rhythm-heading p {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: calc(var(--font-size-base) * 0.72);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .rhythm-heading h2 {
    margin-top: var(--space-1);
    color: var(--text);
    font-family: var(--font-heading);
    font-size: calc(var(--font-size-base) * 1.28);
    font-weight: 600;
  }

  .rhythm-summary {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: calc(var(--font-size-base) * 0.76);
  }

  .rhythm-summary span {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    white-space: nowrap;
  }

  .rhythm-summary strong {
    color: var(--primary);
    font-family: var(--font-heading);
    font-size: calc(var(--font-size-base) * 1.45);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .equalizer {
    min-height: 190px;
    display: grid;
    grid-template-columns: repeat(7, minmax(52px, 1fr));
    align-items: end;
    gap: clamp(8px, 2vw, 30px);
    padding: var(--space-2) clamp(0px, 3vw, 42px) 0;
  }

  .day-column {
    min-width: 0;
    display: grid;
    justify-items: center;
    gap: var(--space-2);
  }

  .sphere-stack {
    position: relative;
    min-height: 150px;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: flex-start;
    gap: 7px;
  }

  .sphere {
    width: clamp(24px, 2.5vw, 34px);
    aspect-ratio: 1;
    display: block;
    border-radius: 50%;
  }

  .sphere.base,
  .sphere.empty {
    width: clamp(36px, 4vw, 52px);
  }

  .sphere.filled {
    background:
      radial-gradient(
        circle at 28% 24%,
        var(--viz-spectrum-1),
        var(--viz-spectrum-3) 48%,
        var(--viz-spectrum-5) 100%
      );
    border: 1px solid color-mix(in srgb, var(--viz-spectrum-2) 70%, white);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--verdigris) 14%, transparent);
  }

  .sphere.empty {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--text-muted) 74%, transparent);
  }

  .overflow-count {
    position: absolute;
    top: -18px;
    color: var(--primary);
    font-family: var(--font-metadata);
    font-size: 11px;
  }

  .day-label {
    display: grid;
    justify-items: center;
    gap: 2px;
    color: var(--text-muted);
    font-family: var(--font-metadata);
  }

  .day-label strong {
    color: inherit;
    font-size: calc(var(--font-size-base) * 0.84);
    font-weight: 600;
  }

  .day-label span {
    font-size: calc(var(--font-size-base) * 0.66);
  }

  .day-column.today .day-label strong {
    color: var(--primary);
  }

  .rhythm-note {
    color: var(--text-muted);
    font-family: var(--font-reading);
    font-size: calc(var(--font-size-base) * 0.8);
    text-align: center;
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

  .rhythm.compact {
    grid-template-rows: auto 1fr auto;
    gap: var(--space-3);
    padding-inline: var(--space-3);
  }

  .compact .rhythm-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-2);
  }

  .compact .rhythm-summary {
    width: 100%;
    justify-content: space-between;
    gap: var(--space-2);
    font-size: calc(var(--font-size-base) * 0.68);
  }

  .compact .rhythm-summary strong {
    font-size: calc(var(--font-size-base) * 1.2);
  }

  .compact .equalizer {
    min-height: 148px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 3px;
    padding: 0;
  }

  .compact .sphere-stack {
    min-height: 128px;
    gap: 4px;
  }

  .compact .sphere {
    width: 22px;
  }

  .compact .sphere.base,
  .compact .sphere.empty {
    width: 32px;
  }

  .compact .day-column {
    gap: var(--space-1);
  }

  .compact .day-label strong {
    font-size: calc(var(--font-size-base) * 0.72);
  }

  .compact .day-label span {
    display: none;
  }

  .compact .rhythm-note {
    font-size: calc(var(--font-size-base) * 0.68);
    line-height: 1.4;
    text-align: left;
  }

  @media (max-width: 720px) {
    .rhythm-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .equalizer {
      min-height: 170px;
      gap: var(--space-1);
      padding-inline: 0;
    }

    .sphere-stack {
      min-height: 132px;
    }

    .rhythm-note {
      text-align: left;
    }
  }

  @media (max-width: 480px) {
    .rhythm-summary {
      width: 100%;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .rhythm-summary span {
      align-items: flex-start;
      flex-direction: column;
      gap: 0;
    }

    .equalizer {
      grid-template-columns: repeat(7, minmax(32px, 1fr));
    }

    .sphere-stack {
      min-height: 122px;
      gap: 5px;
    }

    .day-label span {
      display: none;
    }
  }
</style>

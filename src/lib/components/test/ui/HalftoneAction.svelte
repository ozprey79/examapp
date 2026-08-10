<script>
  let {
    href,
    label = 'Review',
    ariaLabel = label
  } = $props();

  let canvas = $state();


  function drawHalftone(
    ctx,
    strongColor,
    softColor
  ) {
    const canvas =
      ctx.canvas;

    const cols = 5;
    const rows = 5;

    const W =
      canvas.width;

    const H =
      canvas.height;

    const cw =
      W / cols;

    const ch =
      H / rows;

    const cx =
      cols / 2;

    const cy =
      rows / 2;

    const maxD =
      Math.sqrt(
        cx * cx +
        cy * cy
      );


    ctx.clearRect(
      0,
      0,
      W,
      H
    );


    for (
      let row = 0;
      row < rows;
      row++
    ) {
      for (
        let col = 0;
        col < cols;
        col++
      ) {
        const dx =
          col +
          0.5 -
          cx;

        const dy =
          row +
          0.5 -
          cy;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );

        const t =
          Math.max(
            0,
            1 -
              distance /
                maxD
          );

        const radius =
          Math.min(
            cw,
            ch
          ) *
          0.45 *
          t;


        ctx.beginPath();

        ctx.arc(
          (
            col +
            0.5
          ) *
            cw,

          (
            row +
            0.5
          ) *
            ch,

          radius,

          0,

          Math.PI * 2
        );


        ctx.fillStyle =
          t > 0.5
            ? strongColor
            : softColor;


        ctx.fill();
      }
    }
  }


  $effect(() => {
    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext(
        '2d'
      );


    const styles =
      getComputedStyle(
        canvas
      );


    const strongColor =
      styles
        .getPropertyValue(
          '--halftone-strong'
        )
        .trim();


    const softColor =
      styles
        .getPropertyValue(
          '--halftone-soft'
        )
        .trim();


    drawHalftone(
      ctx,
      strongColor,
      softColor
    );
  });
</script>


<a
  class="halftone-action"
  {href}
  aria-label={ariaLabel}
>
  <canvas
    bind:this={canvas}
    width="28"
    height="28"
    aria-hidden="true"
  ></canvas>

  <span>
    {label}
  </span>

  <span
    class="arrow"
    aria-hidden="true"
  >
    →
  </span>
</a>


<style>
  .halftone-action {
    min-height: 44px;

    display:
      inline-flex;

    align-items:
      center;

    gap:
      var(--space-3);

    padding:
      0
      var(--space-4);

    background:
      var(--action-muted);

    color:
      var(--primary);

    border:
      0px solid
      var(--border-soft);

    border-radius:
      var(--radius);

    font: inherit;

    font-size:
      var(--font-size-base);

    font-weight: 500;

    text-decoration: none;

    transition:
      background 150ms ease,
      border-color 150ms ease,
      transform 100ms ease;

  }


  .halftone-action:hover {
    background:
      var(--action-muted-hover);

    border-color:
      var(--primary);
  }


  .halftone-action:active {
    transform:
      scale(0.97);
  }


  canvas {
    width: 28px;

    height: 28px;

    flex: 0 0 auto;

    --halftone-strong:
      var(--primary);

    --halftone-soft:
      var(--primary-muted);
  }


  .arrow {
    margin-left:
      var(--space-1);

    opacity: 0.6;

    transition:
      transform 150ms ease;
  }


  .halftone-action:hover
    .arrow {
    transform:
      translateX(3px);
  }
</style>
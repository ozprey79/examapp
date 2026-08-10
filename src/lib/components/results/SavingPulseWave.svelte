<script>
  import {
    onMount
  } from 'svelte';


  let {
    title = 'Examination',
    speed = 1
  } = $props();


  let canvas;
  let canvasWrap;


  onMount(() => {
    const ctx =
      canvas.getContext(
        '2d'
      );

    if (!ctx) {
      return;
    }


    let animationFrame;

    let time =
      0;

    let lastTime =
      0;


    const GRID_SIZE =
      15;

    const WAVE_WIDTH =
      60;


    function easeInOutCubic(
      value
    ) {
      return (
        value < 0.5
          ? 4 *
            value *
            value *
            value

          : 1 -
            Math.pow(
              -2 * value + 2,
              3
            ) /
            2
      );
    }


    function resizeCanvas() {
      const rect =
        canvasWrap
          .getBoundingClientRect();


      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          2
        );


      canvas.width =
        rect.width *
        dpr;

      canvas.height =
        rect.height *
        dpr;


      canvas.style.width =
        `${rect.width}px`;

      canvas.style.height =
        `${rect.height}px`;


      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    }


    function getDotColor() {
      return (
        getComputedStyle(
          canvas
        )
          .getPropertyValue(
            '--primary'
          )
          .trim() ||
        'currentColor'
      );
    }


    function animate(
      timestamp
    ) {
      if (!lastTime) {
        lastTime =
          timestamp;
      }


      const deltaTime =
        timestamp -
        lastTime;


      lastTime =
        timestamp;


      time +=
        deltaTime *
        0.16 *
        speed;


      const width =
        canvasWrap.clientWidth;

      const height =
        canvasWrap.clientHeight;


      const centerX =
        width / 2;

      const centerY =
        height / 2;


      const spacingX =
        width /
        (
          GRID_SIZE -
          1
        );


      const spacingY =
        height /
        (
          GRID_SIZE -
          1
        );


      const maxWaveRadius =
        Math.hypot(
          width,
          height
        ) * 0.7;


      const waveRadius =
        time %
        (
          maxWaveRadius +
          WAVE_WIDTH
        );


      ctx.clearRect(
        0,
        0,
        width,
        height
      );


      const dotColor =
        getDotColor();


      for (
        let row = 0;
        row < GRID_SIZE;
        row++
      ) {

        for (
          let column = 0;
          column < GRID_SIZE;
          column++
        ) {

          const x =
            column *
            spacingX;

          const y =
            row *
            spacingY;


          const distance =
            Math.hypot(
              x - centerX,
              y - centerY
            );


          const distanceToWave =
            Math.abs(
              distance -
              waveRadius
            );


          let displacement =
            0;


          if (
            distanceToWave <
            WAVE_WIDTH / 2
          ) {

            const normalized =
              1 -
              (
                distanceToWave /
                (
                  WAVE_WIDTH /
                  2
                )
              );


            displacement =
              easeInOutCubic(
                normalized
              ) *
              11;
          }


          const angle =
            Math.atan2(
              y - centerY,
              x - centerX
            );


          const dx =
            Math.cos(
              angle
            ) *
            displacement;


          const dy =
            Math.sin(
              angle
            ) *
            displacement;


          const influence =
            Math.abs(
              displacement
            ) /
            11;


          const opacity =
            0.16 +
            influence *
            0.84;


          const radius =
            1.1 +
            influence *
            2.5;


          ctx.beginPath();


          ctx.arc(
            x + dx,
            y + dy,
            radius,
            0,
            Math.PI * 2
          );


          ctx.fillStyle =
            dotColor;


          ctx.globalAlpha =
            opacity;


          ctx.fill();
        }
      }


      ctx.globalAlpha =
        1;


      animationFrame =
        requestAnimationFrame(
          animate
        );
    }


    resizeCanvas();


    const resizeObserver =
      new ResizeObserver(
        resizeCanvas
      );


    resizeObserver.observe(
      canvasWrap
    );


    animationFrame =
      requestAnimationFrame(
        animate
      );


    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      resizeObserver.disconnect();
    };
  });
</script>


<section
  class="saving-state"
  aria-live="polite"
  aria-busy="true"
>

  <div
    class="wave-field"
    bind:this={canvasWrap}
    aria-hidden="true"
  >

    <canvas
      bind:this={canvas}
    ></canvas>


    <div class="wave-core">

      <span class="core-dot"></span>

    </div>

  </div>


  <!-- <div class="saving-copy">

    <p class="eyebrow">
      Completed Test
    </p>


    <h1>
      {title}
    </h1>


    <div class="saving-status">

      <span class="status-indicator"></span>

      <span>
        Saving your result
      </span>


      <span
        class="saving-dots"
        aria-hidden="true"
      >
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>

    </div>

  </div> -->

</section>


<style>
  .saving-state {
    min-height:
      750px;

    display:
      grid;

    grid-template-columns:
      minmax(20px, 0.4fr)
      ;

    align-items:
      center;

    gap:
      var(--space-8);

    padding:
      var(--space-8) 0;

    border-top:
      1px solid
      var(--border-soft);

    border-bottom:
      0px solid
      var(--border-soft);
      /* background-color: brown; */
      justify-content: center;
  }


  /* =============================================
     Halftone wave
  ============================================= */

  .wave-field {
    position:
      relative;

    min-height:
      320px;

    overflow:
      hidden;
      /* background-color: aqua; */

    justify-content: center;
    aspect-ratio: 1/1;

  }


  canvas {
    position:
      absolute;

    inset:
      0;

    display:
      block;

    width:
      100%;

    height:
      100%;
  }


  .wave-core {
    position:
      absolute;

    inset:
      0;

    display:
      grid;

    place-items:
      center;

    pointer-events:
      none;
  }


  .core-dot {
    width:
      var(--space-3);

    height:
      var(--space-3);

    background-color:
      var(--primary);

    border-radius:
      50%;

    animation:
      core-pulse
      1.4s
      ease-in-out
      infinite;
  }


  @keyframes core-pulse {

    0%,
    100% {
      transform:
        scale(0.8);

      opacity:
        0.45;
    }


    50% {
      transform:
        scale(1.35);

      opacity:
        1;
    }

  }


  /* =============================================
     Copy
  ============================================= */

  .saving-copy {
    display:
      grid;

    align-content:
      center;

    gap:
      var(--space-3);
  }


  .eyebrow {
    margin:
      0;

    color:
      var(--text-muted);

    text-transform:
      uppercase;

    letter-spacing:
      0.08em;
  }


  h1 {
    margin:
      0;

    color:
      var(--primary);

    font-size:
      calc(
        var(--font-size-base) *
        1.8
      );

    line-height:
      1.2;
  }


  .saving-status {
    display:
      flex;

    align-items:
      center;

    gap:
      var(--space-2);

    margin-top:
      var(--space-2);

    color:
      var(--text-muted);
  }


  .status-indicator {
    width:
      var(--space-2);

    height:
      var(--space-2);

    flex:
      0 0 auto;

    background-color:
      var(--primary);

    border-radius:
      50%;

    animation:
      status-pulse
      1.2s
      ease-in-out
      infinite;
  }


  .saving-dots {
    display:
      inline-flex;
  }


  .saving-dots span {
    animation:
      dot-wave
      1.2s
      ease-in-out
      infinite;
  }


  .saving-dots span:nth-child(2) {
    animation-delay:
      0.15s;
  }


  .saving-dots span:nth-child(3) {
    animation-delay:
      0.3s;
  }


  @keyframes status-pulse {

    0%,
    100% {
      opacity:
        0.3;
    }


    50% {
      opacity:
        1;
    }

  }


  @keyframes dot-wave {

    0%,
    60%,
    100% {
      opacity:
        0.25;

      transform:
        translateY(0);
    }


    30% {
      opacity:
        1;

      transform:
        translateY(-2px);
    }

  }


  /* =============================================
     Responsive
  ============================================= */

  @media (
    max-width: 700px
  ) {

    .saving-state {
      grid-template-columns:
        1fr;

      gap:
        var(--space-4);
    }


    .wave-field {
      min-height:
        280px;
    }


    .saving-copy {
      justify-items:
        center;

      text-align:
        center;
    }

  }


  @media (
    prefers-reduced-motion:
      reduce
  ) {

    .core-dot,
    .status-indicator,
    .saving-dots span {
      animation:
        none;
    }

  }
</style>
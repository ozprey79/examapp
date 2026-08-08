<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container;

  onMount(() => {
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -1, 1, 1, -1, 0, 1
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    container.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },

      // The original value (0.035) was stronger than the very dark
      // palette and pushed much of the final colour below zero.
      filmGrainIntensity: { value: 0.008 }
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform float filmGrainIntensity;

      mat2 Rot(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      vec2 hash(vec2 p) {
        p = vec2(
          dot(p, vec2(2127.1, 81.17)),
          dot(p, vec2(1269.5, 283.37))
        );

        return fract(
          sin(p) * 43758.5453
        );
      }

      float noise(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        vec2 u =
          f * f *
          (3.0 - 2.0 * f);

        float n = mix(
          mix(
            dot(
              -1.0 + 2.0 * hash(i + vec2(0.0, 0.0)),
              f - vec2(0.0, 0.0)
            ),
            dot(
              -1.0 + 2.0 * hash(i + vec2(1.0, 0.0)),
              f - vec2(1.0, 0.0)
            ),
            u.x
          ),
          mix(
            dot(
              -1.0 + 2.0 * hash(i + vec2(0.0, 1.0)),
              f - vec2(0.0, 1.0)
            ),
            dot(
              -1.0 + 2.0 * hash(i + vec2(1.0, 1.0)),
              f - vec2(1.0, 1.0)
            ),
            u.x
          ),
          u.y
        );

        return 0.5 + 0.5 * n;
      }

      float filmGrainNoise(in vec2 uv) {
        return length(hash(uv));
      }

      void main() {
        vec2 uv =
          gl_FragCoord.xy /
          max(iResolution.xy, vec2(1.0));

        float aspectRatio =
          iResolution.x /
          max(iResolution.y, 1.0);

        vec2 tuv =
          uv - 0.5;

        float degree =
          noise(
            vec2(
              iTime * 0.05,
              tuv.x * tuv.y
            )
          );

        tuv.y *= 1.0 / aspectRatio;

        tuv *= Rot(
          radians(
            (degree - 0.5) *
            720.0 +
            180.0
          )
        );

        tuv.y *= aspectRatio;

        float frequency = 5.0;
        float amplitude = 30.0;
        float speed = iTime * 2.0;

        tuv.x +=
          sin(
            tuv.y * frequency +
            speed
          ) / amplitude;

        tuv.y +=
          sin(
            tuv.x *
            frequency *
            1.5 +
            speed
          ) /
          (amplitude * 0.5);

        /*
          Off-white sweet light rose palette.
          High-key luminance — creamy whites, blush pinks,
          dusty roses, soft peaches. Nothing dips below
          a mid-light value so the whole field stays airy.
        */
        vec3 amberYellow =
          vec3(255.0, 240.0, 232.0) / 255.0;  // warm cream

        vec3 deepBlue =
          vec3(242.0, 210.0, 215.0) / 255.0;  // soft blush

        vec3 pink =
          vec3(255.0, 228.0, 225.0) / 255.0;  // petal white-pink

        vec3 blue =
          vec3(230.0, 190.0, 198.0) / 255.0;  // dusty rose

        vec3 purpleHaze =
          vec3(248.0, 220.0, 228.0) / 255.0;  // rose mist

        vec3 swampyBlack =
          vec3(255.0, 248.0, 245.0) / 255.0;  // off-white ivory

        vec3 persimmonOrange =
          vec3(252.0, 210.0, 200.0) / 255.0;  // light peach-rose

        vec3 darkAmber =
          vec3(238.0, 198.0, 205.0) / 255.0;  // muted antique rose

        float cycle =
          sin(iTime * 0.5);

        float t =
          (
            sign(cycle) *
            pow(abs(cycle), 0.6) +
            1.0
          ) / 2.0;

        vec3 color1 =
          mix(
            amberYellow,
            purpleHaze,
            t
          );

        vec3 color2 =
          mix(
            deepBlue,
            swampyBlack,
            t
          );

        vec3 color3 =
          mix(
            pink,
            persimmonOrange,
            t
          );

        vec3 color4 =
          mix(
            blue,
            darkAmber,
            t
          );

        vec2 rotatedTuv =
          tuv * Rot(radians(-5.0));

        float horizontalMix =
          smoothstep(
            -0.3,
            0.2,
            rotatedTuv.x
          );

        vec3 layer1 =
          mix(
            color3,
            color2,
            horizontalMix
          );

        vec3 layer2 =
          mix(
            color4,
            color1,
            horizontalMix
          );

        /*
          The uploaded shader used smoothstep(0.5, -0.3, ...).
          Reversed smoothstep edges are undefined in GLSL.
          This is the equivalent stable form.
        */
        float verticalMix =
          1.0 -
          smoothstep(
            -0.3,
            0.5,
            tuv.y
          );

        vec3 color =
          mix(
            layer1,
            layer2,
            verticalMix
          );

        float grain =
          filmGrainNoise(
            uv +
            fract(iTime * 0.013)
          );

        color -=
          grain *
          filmGrainIntensity;

        // Prevent the film grain from crushing the shader to black.
        color = max(
          color,
          vec3(0.004)
        );

        gl_FragColor =
          vec4(color, 1.0);
      }
    `;

    const material =
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
      });

    const geometry =
      new THREE.PlaneGeometry(2, 2);

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    scene.add(mesh);

    function resize() {
      const width =
        Math.max(
          1,
          container.clientWidth
        );

      const height =
        Math.max(
          1,
          container.clientHeight
        );

      renderer.setSize(
        width,
        height,
        false
      );

      uniforms
        .iResolution
        .value
        .set(
          width,
          height
        );
    }

    const resizeObserver =
      new ResizeObserver(resize);

    resizeObserver.observe(container);
    resize();

    let animationFrameId;

    function animate(time) {
      uniforms.iTime.value =
        time * 0.001;

      renderer.render(
        scene,
        camera
      );

      animationFrameId =
        requestAnimationFrame(
          animate
        );
    }

    animationFrameId =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      resizeObserver.disconnect();

      scene.remove(mesh);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      renderer.domElement.remove();
    };
  });
</script>

<div
  class="shader-background"
  bind:this={container}
  aria-hidden="true"
></div>

<style>
  .shader-background {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    overflow: hidden;

    background: #050505;
  }

  .shader-background :global(canvas) {
    display: block;

    width: 100%;
    height: 100%;
  }
</style>
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
      // xy = current mouse pos in GLSL coords (origin bottom-left)
      // zw = position at last click (Shadertoy convention)
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },

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
      uniform vec4 iMouse;
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

        // Mouse influence: pull tuv gently toward the cursor.
        // iMouse.xy is in pixel coords (bottom-left origin); convert
        // to the same [-0.5, 0.5] centred space as tuv.
        vec2 mouseNorm =
          iMouse.xy /
          max(iResolution.xy, vec2(1.0)) - 0.5;

        // Strength falls off with distance so far-away cursor has
        // minimal effect; 0.18 keeps the pull subtle.
        float mouseDist =
          length(tuv - mouseNorm);

        float mouseStrength =
          0.18 /
          (1.0 + mouseDist * 6.0);

        tuv +=
          (mouseNorm - tuv) *
          mouseStrength;

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
          Grey, charcoal, verdigris palette.
          Cool neutral greys anchor the base; verdigris (oxidised
          copper teal-green) punches through as the accent hue.
        */
        vec3 amberYellow =
          vec3(18.0, 36.0, 30.0) / 255.0;   // mid verdigris

        vec3 deepBlue =
          vec3(6.0,  68.0,  67.0)  / 255.0;   // deep charcoal, green-tinted

        vec3 pink =
          vec3(28.0, 48.0, 38.0) / 255.0;   // bright verdigris

        vec3 blue =
          vec3(10.0, 10.0, 10.0) / 255.0;   // pure charcoal

        vec3 purpleHaze =
          vec3(20.0, 22.0, 18.0) / 255.0;   // cool mid-grey

        vec3 swampyBlack =
          vec3(4.0,  4.0,  4.0)  / 255.0;   // near-black charcoal

        vec3 persimmonOrange =
          vec3(10.0, 20.0, 15.0) / 255.0;   // dark verdigris shadow

        vec3 darkAmber =
          vec3(32.0, 33.0, 30.0) / 255.0;   // light warm grey

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

    // ---------- iMouse tracking ----------
    // We listen on window (not the canvas) so pointer-events: none
    // on the container element can stay as-is.
    //
    // GLSL fragCoord has origin at bottom-left; DOM has origin at
    // top-left — so we flip Y: glslY = height - domY.

    function updateMouseXY(e) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.height - (e.clientY - rect.top); // flip Y
      uniforms.iMouse.value.x = x;
      uniforms.iMouse.value.y = y;
    }

    function onPointerMove(e) {
      updateMouseXY(e);
    }

    function onPointerDown(e) {
      updateMouseXY(e);
      // zw = click position (Shadertoy convention)
      uniforms.iMouse.value.z = uniforms.iMouse.value.x;
      uniforms.iMouse.value.w = uniforms.iMouse.value.y;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    // -------------------------------------

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

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);

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

  z-index: 0;

  width: 100%;
  height: 100%;

  overflow: hidden;

  pointer-events: none;

  background: #050505;
}
  .shader-background :global(canvas) {
    display: block;

    width: 100%;
    height: 100%;
  }
</style>
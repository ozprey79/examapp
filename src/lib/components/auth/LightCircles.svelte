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
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iMouse:      { value: new THREE.Vector2(0, 0) }
    };

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  iMouse;

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;

        vec2 uv    = 1.5 * (2.0 * fragCoord    - iResolution) / iResolution.y;
        vec2 mouse = 1.5 * (2.0 * iMouse       - iResolution) / iResolution.y;

        vec2 offset = vec2(
          cos(iTime / 2.0) * mouse.x,
          sin(iTime / 2.0) * mouse.y
        );

        vec3 light_color = vec3(0.9, 0.65, 0.5);

        float light = 0.1 / distance(normalize(uv), uv);

        if (length(uv) < 1.0) {
          light *= 0.1 / distance(
            normalize(uv - offset),
            uv - offset
          );
        }

        gl_FragColor = vec4(light * light_color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- resize ---
    function resize() {
      const width  = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);

      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(width, height);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // --- mouse tracking (Y flipped for GLSL convention) ---
    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      uniforms.iMouse.value.set(
        e.clientX - rect.left,
        uniforms.iResolution.value.y - (e.clientY - rect.top)
      );
    }

    function onTouchMove(e) {
      const rect  = container.getBoundingClientRect();
      const touch = e.touches[0];
      uniforms.iMouse.value.set(
        touch.clientX - rect.left,
        uniforms.iResolution.value.y - (touch.clientY - rect.top)
      );
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove',  onTouchMove, { passive: true });

    // seed mouse to centre so the inner light is visible on load
    uniforms.iMouse.value.set(
      uniforms.iResolution.value.x / 2,
      uniforms.iResolution.value.y / 2
    );

    // --- animation loop ---
    let animationFrameId;

    function animate(time) {
      uniforms.iTime.value = time * 0.001;

      renderer.render(scene, camera);

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    // --- teardown ---
    return () => {
      cancelAnimationFrame(animationFrameId);

      resizeObserver.disconnect();

      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove',  onTouchMove);

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

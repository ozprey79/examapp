<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container;

  onMount(() => {
    if (!container) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
      precision highp float;

      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  iMouse;

      // ── Noise helpers ──────────────────────────────────────────────

      vec3 hash3(vec2 p) {
        vec3 q = vec3(
          dot(p, vec2(127.1, 311.7)),
          dot(p, vec2(269.5, 183.3)),
          dot(p, vec2(419.2,  371.9))
        );
        return fract(sin(q) * 43758.5453);
      }

      // Smooth value noise, returns [0,1]
      float vnoise(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);

        float a = dot(hash3(i + vec2(0,0)).xy, f - vec2(0,0));
        float b = dot(hash3(i + vec2(1,0)).xy, f - vec2(1,0));
        float c = dot(hash3(i + vec2(0,1)).xy, f - vec2(0,1));
        float d = dot(hash3(i + vec2(1,1)).xy, f - vec2(1,1));

        return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      // Fractal Brownian motion – 6 octaves for fine molten detail
      float fbm(vec2 p) {
        float v   = 0.0;
        float amp = 0.5;
        float frq = 1.0;
        mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

        for (int i = 0; i < 6; i++) {
          v   += amp * vnoise(p * frq);
          frq *= 2.03;
          amp *= 0.48;
          p    = rot * p;
        }
        return v;
      }

      // ── Domain-warped flow field ────────────────────────────────────
      //  Two layers of warp give the sluggish, viscous feel of
      //  heavy liquid metal pooling and folding over itself.

      float flow(vec2 p, float t) {
        // First warp pass – large, slow eddies
        vec2 q = vec2(
          fbm(p + vec2(0.8,  0.9) + 0.13 * t),
          fbm(p + vec2(5.2,  1.3) + 0.11 * t)
        );

        // Second warp pass – smaller, faster ripples
        vec2 r = vec2(
          fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.17 * t),
          fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.15 * t)
        );

        return fbm(p + 4.8 * r + 0.07 * t);
      }

      // ── Iridium palette ────────────────────────────────────────────
      //  Iridium is a dense platinum-group metal with a near-mirror
      //  silver base and a characteristic blue-violet iridescence that
      //  shifts to gold, copper, and green at glancing angles.
      //  The palette below maps that spectral walk across [0,1].

      vec3 iridiumColor(float t, float fresnel) {
        // Core metal tones: near-black → cool silver
        vec3 dark   = vec3(0.4,  0.04,  0.06);   // near-black void
        vec3 silver = vec3(0.2,  0.74,  0.80);   // cool platinum-silver

        // Iridescent shift tones (appear at mid and high values)
        vec3 violet = vec3(0.0,  0.0,  0.3);   // deep blue-violet
        vec3 cobalt = vec3(0.8,  0.38,  0.78);   // electric cobalt
        vec3 teal   = vec3(0.05,  0.2,  0.70);   // peacock teal
        vec3 gold   = vec3(0.0,  0.0,  0.22);   // molten gold edge
        vec3 copper = vec3(0.0,  0.2,  0.0);   // copper-hot vein

        // Base metallic gradient (dark core → silver crust)
        vec3 base = mix(dark, silver, smoothstep(0.0, 0.7, t));

        // Iridescent spectral layer – cycles through the hue arc
        float spec = t * 2.5 + fresnel * 1.2;
        vec3 irid;
        if (spec < 1.0) {
          irid = mix(violet, cobalt, spec);
        } else if (spec < 2.0) {
          irid = mix(cobalt, teal, spec - 1.0);
        } else if (spec < 3.0) {
          irid = mix(teal, gold, spec - 2.0);
        } else {
          irid = mix(gold, copper, clamp(spec - 3.0, 0.0, 1.0));
        }

        // Blend: base metal underlies, iridescence rides the bright zones
        float iridMask = smoothstep(0.25, 0.75, t) * (0.6 + 0.4 * fresnel);
        vec3  col      = mix(base, irid, iridMask);

        // Specular hot-spots: pure silver-white glints at the surface peaks
        float glint = pow(max(0.0, t - 0.82) / 0.18, 2.5);
        col = mix(col, vec3(0.5, 0.56, 1.00), glint * 0.9);

        return col;
      }

      // ── Main ───────────────────────────────────────────────────────

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;

        // Normalised UV, aspect-corrected, centred on [−1,1]
        vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

        // Mouse influence: gentle surface pull toward cursor
        vec2 mouse = (2.5 * iMouse - iResolution.xy) / iResolution.y;
        float mouseDist = length(uv - mouse);
        float mouseWarp = 0.18 * exp(-mouseDist * 2.2);

        // Scale into noise space; slow time-drift for viscous feel
        float t   = iTime * 0.18;
        vec2  p   = uv * 1.6 + vec2(0.0, t * 0.3);

        // Pull surface slightly toward cursor
        p += normalize(mouse - uv + 0.001) * mouseWarp;

        // Primary flow field value
        float f = flow(p, t);

        // Second pass for surface-normal approximation (cheap fake lighting)
        float eps   = 0.003;
        float fx    = flow(p + vec2(eps, 0.0), t);
        float fy    = flow(p + vec2(0.0, eps), t);
        vec2  grad  = vec2(fx - f, fy - f) / eps;

        // Fake Fresnel: surface tilt relative to view  → iridescent flare
        float fresnel = clamp(length(grad) * 18.0, 0.0, 1.0);

        // Sharpen with a subtle power curve for crisper veins
        float fSharp = pow(clamp(f, 0.0, 1.0), 0.85);

        // Flowing viscosity lines – dark channels between bright lobes
        float viscosity = smoothstep(0.38, 0.45, f) *
                          (1.0 - smoothstep(0.55, 0.62, f));

        // Colour
        vec3 col = iridiumColor(fSharp, fresnel);

        // Darken the viscous channel seams
        col = mix(col, vec3(0.02, 0.02, 0.04), viscosity * 0.55);

        // Subtle edge vignette – draws the eye to the molten centre
        float vign = 1.0 - smoothstep(0.55, 1.55, length(uv * vec2(0.85, 1.0)));
        col *= 0.55 + 0.45 * vign;

        // Gamma-approximate (2.2 → linear bake)
        col = pow(max(col, vec3(0.0)), vec3(0.9));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh     = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Resize ───────────────────────────────────────────────────────
    function resize() {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w, h);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // ── Mouse / touch ─────────────────────────────────────────────────
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

    // Seed mouse to centre
    uniforms.iMouse.value.set(
      uniforms.iResolution.value.x / 2,
      uniforms.iResolution.value.y / 2
    );

    // ── Animate ───────────────────────────────────────────────────────
    let animationFrameId;

    function animate(time) {
      uniforms.iTime.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    // ── Teardown ──────────────────────────────────────────────────────
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

    background: #020204;
  }

  .shader-background :global(canvas) {
    display: block;

    width: 100%;
    height: 100%;
  }
</style>

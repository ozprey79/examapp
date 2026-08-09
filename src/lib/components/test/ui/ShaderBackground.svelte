<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container;

  onMount(() => {
    const scene =
      new THREE.Scene();

    const camera =
      new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0,
        1
      );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: false,
        alpha: false
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    container.appendChild(
      renderer.domElement
    );

    const uniforms = {
      iTime: {
        value: 0
      },

      iResolution: {
        value:
          new THREE.Vector2()
      },

      iMouse: {
        value:
          new THREE.Vector4(
            0,
            0,
            0,
            0
          )
      }
    };

    const vertexShader = `
      void main() {
        gl_Position =
          vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec4 iMouse;

      mat2 rotate(float theta) {
        return mat2(
          cos(theta),
          -sin(theta),
          sin(theta),
          cos(theta)
        );
      }

      float random(vec2 st) {
        return fract(
          sin(
            dot(
              st.xy,
              vec2(
                1.9898,
                78.233
              )
            )
          ) *
          43758.5453123
        );
      }

      vec2 random2d(vec2 x) {
        return fract(
          sin(
            vec2(
              dot(
                x,
                vec2(
                  127.1,
                  311.7
                )
              ),
              dot(
                x,
                vec2(
                  269.5,
                  183.3
                )
              )
            )
          ) *
          43758.5453
        );
      }

      float gradient_noise(
        vec2 x
      ) {
        vec2 i = floor(x);
        vec2 f = fract(x);

        vec2 u =
          f * f *
          (3.0 - 2.0 * f);

        return mix(
          mix(
            dot(
              random2d(
                i +
                vec2(0.0, 0.0)
              ),
              f -
              vec2(0.0, 0.0)
            ),
            dot(
              random2d(
                i +
                vec2(1.0, 0.0)
              ),
              f -
              vec2(1.0, 0.0)
            ),
            u.x
          ),
          mix(
            dot(
              random2d(
                i +
                vec2(0.0, 1.0)
              ),
              f -
              vec2(0.0, 1.0)
            ),
            dot(
              random2d(
                i +
                vec2(1.0, 1.0)
              ),
              f -
              vec2(1.0, 1.0)
            ),
            u.x
          ),
          u.y
        ) * 1.5;
      }

      void main() {
        vec2 fragCoord =
          gl_FragCoord.xy;

        vec2 uv =
          fragCoord /
          iResolution.y;

        vec3 color =
          vec3(0.0);

        float zoom = 5.0;

        uv *= zoom;

        uv *= rotate(
          gradient_noise(uv)
        );

        vec2 uv_i =
          floor(uv);

        float m_dist =
          1.0;

        for (
          int j = -1;
          j < 2;
          ++j
        ) {
          for (
            int i = -1;
            i < 2;
            ++i
          ) {
            vec2 n =
              uv_i +
              vec2(
                float(i),
                float(j)
              );

            vec2 pt =
              random2d(n);

            pt =
              0.5 +
              0.5 *
              sin(
                iTime +
                6.0 * pt
              );

            vec2 v =
              n +
              pt -
              uv;

            float d =
              length(v);

            m_dist =
              min(
                m_dist,
                d
              );
          }
        }

        float intensity =
          m_dist +
          random(uv) *
          0.5;

        color =
          mix(
            vec3(0.0),
            vec3(
              0.1,
              0.1,
              0.1
            ),
            intensity
          );

        gl_FragColor =
          vec4(
            color,
            1.0
          );
      }
    `;

    const material =
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
      });

    const geometry =
      new THREE.PlaneGeometry(
        2,
        2
      );

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    scene.add(mesh);

    let mouseX = 0;
    let mouseY = 0;

    function resize() {
      const {
        clientWidth,
        clientHeight
      } = container;

      renderer.setSize(
        clientWidth,
        clientHeight,
        false
      );

      uniforms
        .iResolution
        .value
        .set(
          clientWidth,
          clientHeight
        );
    }

    function handlePointerMove(
      event
    ) {
      const rect =
        container
          .getBoundingClientRect();

      mouseX =
        event.clientX -
        rect.left;

      mouseY =
        rect.height -
        (
          event.clientY -
          rect.top
        );
    }

    resize();

    window.addEventListener(
      'resize',
      resize
    );

    container.addEventListener(
      'pointermove',
      handlePointerMove
    );

    let animationFrame;

    function animate(time) {
      uniforms.iTime.value =
        time * 0.001;

      uniforms
        .iMouse
        .value
        .set(
          mouseX,
          mouseY,
          0,
          0
        );

      renderer.render(
        scene,
        camera
      );

      animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    animationFrame =
      requestAnimationFrame(
        animate
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        'resize',
        resize
      );

      container.removeEventListener(
        'pointermove',
        handlePointerMove
      );

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

    background: #090909;
  }

  .shader-background :global(canvas) {
    display: block;

    width: 100%;
    height: 100%;
  }
</style>
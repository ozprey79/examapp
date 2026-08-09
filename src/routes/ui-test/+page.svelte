<script>
  import ShaderBackground
    from '$lib/components/test/ui/ShaderBackground.svelte';

  /*
    KEEP YOUR EXISTING BETTER AUTH
    LOGIN STATE / FUNCTIONS HERE.

    Do not replace your working
    authentication logic.
  */

  let email = $state('');
  let password = $state('');
</script>

<svelte:head>
  <title>Sign in</title>
</svelte:head>

<div class="login-page">

  <ShaderBackground />

  <div
    class="background-shade"
    aria-hidden="true"
  ></div>

  <main class="login-stage">

    <section class="login-panel">

      <header class="login-header">
        <p class="system-label">
          EXAM SYSTEM
        </p>

        <h1>
          Sign in
        </h1>

        <p class="description">
          Continue to your workspace.
        </p>
      </header>


      <form
        class="login-form"
      >
        <label>
          <span>
            Email
          </span>

          <input
            type="email"
            bind:value={email}
            autocomplete="email"
            placeholder="name@example.com"
          />
        </label>


        <label>
          <span>
            Password
          </span>

          <input
            type="password"
            bind:value={password}
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </label>


        <button
          class="sign-in-button"
          type="submit"
        >
          Sign in
        </button>
      </form>


      <footer>
        <span>
          AUTH / SECURE ACCESS
        </span>
      </footer>

    </section>

  </main>

</div>
<style>
  .login-page {
    position: relative;

    width: 100%;
    min-height: 100svh;

    overflow: hidden;

    background: #080808;

    font-family:
      "Cascadia Code",
      "SFMono-Regular",
      "Roboto Mono",
      "Liberation Mono",
      ui-monospace,
      monospace;
  }


  /* -------------------------------- */
  /* Background treatment */
  /* -------------------------------- */

  .background-shade {
    position: absolute;
    inset: 0;

    pointer-events: none;

    background:
      radial-gradient(
        circle at center,
        transparent 0%,
        rgba(0, 0, 0, 0.08) 40%,
        rgba(0, 0, 0, 0.48) 100%
      );
  }


  /* -------------------------------- */
  /* Centering */
  /* -------------------------------- */

  .login-stage {
    position: relative;
    z-index: 1;

    min-height: 100svh;

    display: grid;
    place-items: center;

    padding: 24px;
  }


  /* -------------------------------- */
  /* Login glass panel */
  /* -------------------------------- */

  .login-panel {
    width: min(
      100%,
      380px
    );

    padding: 32px;

    background:
      rgba(
        17,
        17,
        17,
        0.62
      );

    border:
      1px solid
      rgba(
        255,
        255,
        255,
        0.10
      );

    border-radius: 12px;

    box-shadow:
      0
      24px
      70px
      rgba(
        0,
        0,
        0,
        0.28
      );

    backdrop-filter:
      blur(18px)
      saturate(110%);

    -webkit-backdrop-filter:
      blur(18px)
      saturate(110%);
  }


  /* -------------------------------- */
  /* Heading */
  /* -------------------------------- */

  .login-header {
    margin-bottom: 30px;
  }

  .system-label {
    margin:
      0
      0
      16px;

    color:
      rgba(
        255,
        255,
        255,
        0.48
      );

    font-size: 10px;
    font-weight: 600;

    letter-spacing: 0.18em;

    text-transform: uppercase;
  }

  h1 {
    margin: 0;

    color: #f5f5f5;

    font-family: inherit;

    font-size: 25px;
    font-weight: 500;

    letter-spacing: -0.045em;
  }

  .description {
    margin:
      8px
      0
      0;

    color:
      rgba(
        255,
        255,
        255,
        0.5
      );

    font-size: 12px;
  }


  /* -------------------------------- */
  /* Form */
  /* -------------------------------- */

  .login-form {
    display: grid;
    gap: 18px;
  }

  label {
    display: grid;
    gap: 7px;
  }

  label > span {
    color:
      rgba(
        255,
        255,
        255,
        0.62
      );

    font-size: 11px;
    font-weight: 500;
  }

  input {
    width: 100%;
    height: 44px;

    padding:
      0
      13px;

    background:
      rgba(
        255,
        255,
        255,
        0.055
      );

    color: #f5f5f5;

    border:
      1px solid
      rgba(
        255,
        255,
        255,
        0.11
      );

    border-radius: 7px;

    outline: none;

    font-family: inherit;
    font-size: 12px;

    transition:
      border-color 120ms ease,
      background 120ms ease;
  }

  input::placeholder {
    color:
      rgba(
        255,
        255,
        255,
        0.25
      );
  }

  input:hover {
    border-color:
      rgba(
        255,
        255,
        255,
        0.20
      );
  }

  input:focus {
    background:
      rgba(
        255,
        255,
        255,
        0.075
      );

    border-color:
      rgba(
        255,
        255,
        255,
        0.42
      );
  }


  /* -------------------------------- */
  /* Primary action */
  /* -------------------------------- */

  .sign-in-button {
    height: 44px;

    margin-top: 5px;

    background: #ededed;
    color: #111;

    border: 0;
    border-radius: 7px;

    font-family: inherit;
    font-size: 11px;
    font-weight: 700;

    letter-spacing: 0.04em;

    cursor: pointer;

    transition:
      background 120ms ease,
      transform 80ms ease;
  }

  .sign-in-button:hover {
    background: #ffffff;
  }

  .sign-in-button:active {
    transform:
      translateY(1px);
  }


  /* -------------------------------- */
  /* Footer metadata */
  /* -------------------------------- */

  footer {
    margin-top: 24px;
    padding-top: 14px;

    border-top:
      1px solid
      rgba(
        255,
        255,
        255,
        0.08
      );
  }

  footer span {
    color:
      rgba(
        255,
        255,
        255,
        0.28
      );

    font-size: 9px;

    letter-spacing: 0.15em;
  }


  @media (max-width: 480px) {
    .login-stage {
      padding: 16px;
    }

    .login-panel {
      padding:
        26px
        22px;
    }
  }


  @media (
    prefers-reduced-motion:
    reduce
  ) {
    .sign-in-button,
    input {
      transition: none;
    }
  }
</style>
<script>
  import { authClient } from '$lib/auth-client.js';
  import AuthShell from '$lib/components/auth/AuthShell.svelte';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);

  let status = $state('idle');
  let message = $state('');

  async function signIn() {
    status = 'loading';
    message = '';

    const { error } =
      await authClient.signIn.email({
        email,
        password
      });

    if (error) {
      status = 'error';
      message =
        error.message ??
        'Sign in failed.';

      return;
    }

    status = 'success';
    message =
      'Signed in successfully.';

    window.location.href =
      '/account';
  }
</script>

<svelte:head>
  <title>Sign In</title>
</svelte:head>

<AuthShell
  title="Sign in"
  subtitle="Continue to your workspace."
  alternateText="Don't have an account?"
  alternateHref="/sign-up"
  alternateLabel="Create account"
>
  <form
    class="auth-form"
    onsubmit={(event) => {
      event.preventDefault();
      signIn();
    }}
  >
    <div class="auth-field">
      <label for="email">Email</label>

      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        autocomplete="email"
        placeholder="Enter your email"
        required
      />
    </div>

    <div class="auth-field">
      <label for="password">Password</label>

      <div class="password-control">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          autocomplete="current-password"
          placeholder="Enter your password"
          required
        />

        <button
          class="password-toggle"
          type="button"
          aria-label={showPassword
            ? 'Hide password'
            : 'Show password'}
          aria-pressed={showPassword}
          onclick={() => {
            showPassword = !showPassword;
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>

    <button
      class="auth-submit"
      type="submit"
      disabled={status === 'loading'}
    >
      {status === 'loading'
        ? 'SIGNING IN...'
        : 'SIGN IN'}
    </button>
  </form>

  {#if message}
    <p
      class="auth-message {status}"
      aria-live="polite"
      role={status === 'error'
        ? 'alert'
        : 'status'}
    >
      {message}
    </p>
  {/if}
</AuthShell>

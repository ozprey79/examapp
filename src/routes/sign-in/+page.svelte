<script>
  import { authClient } from '$lib/auth-client.js';
  import AuthShell from '$lib/components/auth/AuthShell.svelte';

  let email = $state('');
  let password = $state('');

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
  alternateText=""
  alternateHref="/sign-in"
  alternateLabel=""
>
  <form
    class="auth-form"
    onsubmit={(event) => {
      event.preventDefault();
      signIn();
    }}
  >
    <div class="auth-field">
     <!-- <label for="email">  Email</label>-->

      <input
        id="email"
        type="email"
        bind:value={email}
        autocomplete="email"
        placeholder="Enter your email"
        required
      />
    </div>

    <div class="auth-field">
    

      <input
        id="password"
        type="password"
        bind:value={password}
        autocomplete="current-password"
        placeholder="••••••••"
        required
      />
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
    >
      {message}
    </p>
  {/if}
</AuthShell>

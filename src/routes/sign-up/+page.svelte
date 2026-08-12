<script>
  import { authClient } from '$lib/auth-client.js';
  import AuthShell from '$lib/components/auth/AuthShell.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);

  let status = $state('idle');
  let message = $state('');

  async function signUp() {
    status = 'loading';
    message = '';

    const { error } =
      await authClient.signUp.email({
        name,
        email,
        password
      });

    if (error) {
      status = 'error';
      message =
        error.message ??
        'Sign up failed.';

      return;
    }

    status = 'success';
    message =
      'Account created successfully.';

    window.location.href =
      '/account';
  }
</script>

<svelte:head>
  <title>Create Account</title>
</svelte:head>

<AuthShell
  title="Create account"
  subtitle="Set up your exam workspace."
  alternateText="Already have an account?"
  alternateHref="/sign-in"
  alternateLabel="Sign in"
>
  <form
    class="auth-form"
    onsubmit={(event) => {
      event.preventDefault();
      signUp();
    }}
  >
    <div class="auth-field">
      <label for="name">
        Name
      </label>

      <input
        id="name"
        name="name"
        type="text"
        bind:value={name}
        autocomplete="name"
        placeholder="Your name"
        required
      />
    </div>

    <div class="auth-field">
      <label for="email">
        Email
      </label>

      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        autocomplete="email"
        placeholder="name@example.com"
        required
      />
    </div>

    <div class="auth-field">
      <label for="password">
        Password
      </label>

      <div class="password-control">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          autocomplete="new-password"
          placeholder="Minimum 8 characters"
          required
          minlength="8"
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
        ? 'CREATING ACCOUNT...'
        : 'CREATE ACCOUNT'}
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

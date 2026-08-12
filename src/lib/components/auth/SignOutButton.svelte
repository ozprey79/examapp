<script>
  import {
    authClient
  } from '$lib/auth-client.js';

  let signingOut =
    $state(false);


  async function signOut() {
    if (signingOut) {
      return;
    }

    signingOut = true;

    const { error } =
      await authClient.signOut();

    if (error) {
      console.error(
        'Sign out failed:',
        error
      );

      signingOut = false;
      return;
    }

    window.location.href =
      '/sign-in';
  }
</script>


<button
  type="button"
  onclick={signOut}
  disabled={signingOut}
  aria-label={signingOut ? 'Signing out' : 'Sign out'}
  title={signingOut ? 'Signing out' : 'Sign out'}
>
  {signingOut
    ? 'Signing out...'
    : 'Sign out'}
</button>

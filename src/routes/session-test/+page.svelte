<script>
  import SignOutButton
    from '$lib/components/auth/SignOutButton.svelte';

  let {
    data
  } = $props();
</script>


<h1>
  Session Test
</h1>

{#if data.user}
  <p>
    Signed in
  </p>

  <p>
    Email:
    {data.user.email}
  </p>

  <p>
    User ID:
    {data.user.id}
  </p>

  <p>
    Role:
    {data.profile?.role ?? 'No profile'}
  </p>

  <SignOutButton />
{:else}
  <p>
    No authenticated user.
  </p>
{/if}
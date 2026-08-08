<script>
  import AttemptProgressEqualizer
    from '$lib/components/AttemptProgressEqualizer.svelte';


  let replay =
    $state(0);


  const attempts = [
    {
      label: 'Attempt 1',
      score: 42
    },
    {
      label: 'Attempt 2',
      score: 18
    },
    {
      label: 'Attempt 3',
      score: 35
    },
    {
      label: 'Attempt 4',
      score: 15
    },
    {
      label: 'Attempt 5',
      score: 54
    },
    {
      label: 'Attempt 6',
      score: 78
    },
    {
      label: 'Attempt 7',
      score: 37
    },
    {
      label: 'Attempt 8',
      score: 34
    },
    {
      label: 'Attempt 9',
      score: 52
    },
    {
      label: 'Attempt 10',
      score: 68
    },
    {
      label: 'Attempt 11',
      score: 82
    },
    {
      label: 'Attempt 12',
      score: 31
    }
  ];
</script>


<h1>
  Progress Drill
</h1>


{#key replay}

  <AttemptProgressEqualizer
    {attempts}
  />

{/key}


<button
  type="button"
  onclick={() => {
    replay += 1;
  }}
>
  Replay
</button>
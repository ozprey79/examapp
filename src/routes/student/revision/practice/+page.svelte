<script>
  let { data } = $props();
</script>

<h1>Revise Now</h1>

<h2>Weak Questions</h2>

<p>
  Box 1:
  {data.summary.boxes[1]}
</p>

{#if data.summary.boxes[1] > 0}
  <a href="/student/revision/practice/box-1">
    Practice Weak Questions
  </a>
{/if}

<hr />

<h2>Practice by Box</h2>

{#each [1, 2, 3, 4, 5] as box}
  <p>
    Box {box}
    —
    {data.summary.boxes[box]}
    questions

    {#if data.summary.boxes[box] > 0}
      <a href={`/student/revision/practice/box-${box}`}>
        Practice
      </a>
    {/if}
  </p>
{/each}

<hr />

<h2>All Learned Questions</h2>

<p>
  {data.summary.total}
  questions
</p>

{#if data.summary.total > 0}
  <a href="/student/revision/practice/all">
    Practice All
  </a>
{/if}
<script>
  let { data } = $props();

  let currentIndex = $state(0);
  let selectedAnswer = $state(null);
  let submitted = $state(false);

  const currentQuestion =
    $derived(
      data.questions[currentIndex] ?? null
    );

  const completed =
    $derived(
      currentIndex >= data.questions.length
    );

  function selectAnswer(index) {
    if (submitted) {
      return;
    }

    selectedAnswer = index;
  }
async function submitAnswer() {
  if (
    selectedAnswer === null ||
    !currentQuestion
  ) {
    return;
  }

  const formData =
    new FormData();

  formData.set(
    'questionId',
    currentQuestion.id
  );

  formData.set(
    'selectedAnswer',
    String(selectedAnswer)
  );

  const response =
    await fetch(
      '?/answer',
      {
        method: 'POST',
        body: formData
      }
    );

  if (!response.ok) {
    console.error(
      'Failed to save revision result.'
    );

    return;
  }

  submitted = true;
}

  function nextQuestion() {
    currentIndex += 1;
    selectedAnswer = null;
    submitted = false;
  }
</script>


<h1>Due Review</h1>


{#if data.questions.length === 0}

  <p>
    No questions are currently due.
  </p>

{:else if completed}

  <h2>Revision complete</h2>

  <p>
    You reviewed
    {data.questions.length}
    questions.
  </p>

  <a href="/student/revision">
    Back to Revision
  </a>

{:else}

  <p>
    Question
    {currentIndex + 1}
    of
    {data.questions.length}
  </p>


  <h2>
    {currentQuestion.question_text}
  </h2>


  {#each currentQuestion.options as option, index}

    <button
      type="button"
      onclick={() =>
        selectAnswer(index)
      }
      disabled={submitted}
    >
      {selectedAnswer === index
        ? '●'
        : '○'}

      {String.fromCharCode(
        65 + index
      )}.

      {option}
    </button>

    <br />

  {/each}


  <br />


  {#if !submitted}

    <button
      type="button"
      onclick={submitAnswer}
      disabled={selectedAnswer === null}
    >
      Check Answer
    </button>

  {:else}

    {#if selectedAnswer === currentQuestion.correct_answer}

      <p>
        Correct.
      </p>

    {:else}

      <p>
        Incorrect.
      </p>

      <p>
        Correct answer:
        {String.fromCharCode(
          65 +
          currentQuestion.correct_answer
        )}
      </p>

    {/if}


    {#if currentQuestion.explanation}

      <p>
        {currentQuestion.explanation}
      </p>

    {/if}


    <button
      type="button"
      onclick={nextQuestion}
    >
      Next Question
    </button>

  {/if}

{/if}
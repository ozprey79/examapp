<script>
  let { data } = $props();

  let currentIndex =
    $state(0);

  let selectedAnswer =
    $state(null);

  let submitted =
    $state(false);

  let result =
    $state(null);


  const currentQuestion =
    $derived(
      data.questions[currentIndex] ??
      null
    );


  const completed =
    $derived(
      currentIndex >=
        data.questions.length
    );


  const isLastQuestion =
    $derived(
      currentIndex ===
        data.questions.length - 1
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
        'Failed to check answer.'
      );

      return;
    }

    const responseData =
      await response.json();

    result =
      responseData.data;

    submitted = true;
  }


  function nextQuestion() {
    currentIndex += 1;

    selectedAnswer = null;
    submitted = false;
    result = null;
  }


  async function primaryAction() {
    if (!submitted) {
      await submitAnswer();
      return;
    }

    nextQuestion();
  }
</script>


<h1>
  {data.title}
</h1>


{#if data.questions.length === 0}

  <p>
    No questions are available
    for this revision mode.
  </p>

  <a href="/student/revision/practice">
    Back to Revise Now
  </a>


{:else if completed}

  <h2>
    Practice complete
  </h2>

  <p>
    You revised
    {data.questions.length}
    questions.
  </p>

  <a href="/student/revision/practice">
    Back to Revise Now
  </a>


{:else}

  <p>
    Question
    {currentIndex + 1}
    of
    {data.questions.length}
  </p>

  <p>
    Box {currentQuestion.box}
  </p>


  <h2>
    {currentQuestion.question_text}
  </h2>


  {#each
    currentQuestion.options
    as option, index
  }

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


  {#if submitted && result}

    {#if result.correct}

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
          result.correctAnswer
        )}
      </p>

    {/if}


    {#if result.explanation}
      <p>
        {result.explanation}
      </p>
    {/if}

  {/if}


  <button
    type="button"
    onclick={primaryAction}
    disabled={
      !submitted &&
      selectedAnswer === null
    }
  >
    {#if submitted}
      {isLastQuestion
        ? 'Finish Revision'
        : 'Next Question'}
    {:else}
      Submit Answer
    {/if}
  </button>

{/if}
<script>
  import QuestionCard
    from '$lib/components/exam/QuestionCard.svelte';

  import QuestionFeedback
    from '$lib/components/exam/QuestionFeedback.svelte';


  let {
    questions = [],
    title = 'Revision',
    backHref = '/student/revision'
  } = $props();


  let currentIndex =
    $state(0);

let answers =
  $state({});

let results =
  $state({});

let checking =
  $state(false);

const selectedAnswer =
  $derived(
    currentQuestion
      ? answers[
          currentQuestion.id
        ] ?? null
      : null
  );

const result =
  $derived(
    currentQuestion
      ? results[
          currentQuestion.id
        ] ?? null
      : null
  );

const submitted =
  $derived(
    result !== null
  );


  const currentQuestion =
    $derived(
      questions[currentIndex] ??
      null
    );


  const completed =
    $derived(
      currentIndex >=
        questions.length
    );


  const isLastQuestion =
    $derived(
      currentIndex ===
        questions.length - 1
    );


  /*
    Leitner questions currently use
    database-style field names.

    QuestionCard uses the same compact
    shape as the exam player.
  */

  const cardQuestion =
    $derived(
      currentQuestion
        ? {
            m:
              currentQuestion.module ??
              `Box ${currentQuestion.box}`,

            s:
              currentQuestion.topic ??
              '',

            t:
              currentQuestion.question_text,

            o:
              currentQuestion.options
          }
        : null
    );

function selectAnswer(index) {
  if (
    !currentQuestion ||
    submitted ||
    checking
  ) {
    return;
  }

  answers[
    currentQuestion.id
  ] = index;
}

  async function submitAnswer() {
    if (
      selectedAnswer === null ||
      !currentQuestion ||
      checking
    ) {
      return;
    }


    checking = true;


    try {
      const formData =
        new FormData();


      formData.set(
        'questionId',
        currentQuestion.id
      );


      formData.set(
        'selectedAnswer',
        String(
          selectedAnswer
        )
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
results[
  currentQuestion.id
] = responseData.data;
    } finally {
      checking =
        false;
    }
  }


function previousQuestion() {
  if (currentIndex <= 0) {
    return;
  }

  currentIndex -= 1;
}


function nextQuestion() {
  if (
    currentIndex >=
    questions.length - 1
  ) {
    currentIndex =
      questions.length;

    return;
  }

  currentIndex += 1;
}


  async function primaryAction() {
    if (!submitted) {
      await submitAnswer();

      return;
    }

    nextQuestion();
  }
</script>


<div class="revision-player">

  <header class="revision-header">

    <div>
      <p class="eyebrow">
        Leitner Practice
      </p>

      <h1>
        {title}
      </h1>
    </div>


    <a href={backHref}>
      Exit Revision
    </a>

  </header>


  {#if questions.length === 0}

    <section class="revision-state">

      <h2>
        No questions available
      </h2>

      <p>
        There are currently no
        questions in this revision
        mode.
      </p>

      <a href={backHref}>
        Back to Revision
      </a>

    </section>


  {:else if completed}

    <section class="revision-state">

      <p class="eyebrow">
        Complete
      </p>

      <h2>
        Practice complete
      </h2>

      <p>
        You revised
        {questions.length}
        questions.
      </p>

      <a href={backHref}>
        Back to Revision
      </a>

    </section>


  {:else}

    <div class="revision-position">

      <span>
        Question
        {currentIndex + 1}
        / {questions.length}
      </span>


      {#if currentQuestion.box}

        <span>
          Box
          {currentQuestion.box}
        </span>

      {/if}

    </div>


    <QuestionCard
      mode="practice"
      question={cardQuestion}
      {selectedAnswer}
      {submitted}
      correctAnswer={
        result?.correctAnswer ??
        null
      }
      onSelectAnswer={
        selectAnswer
      }
    />


    {#if submitted && result}

      <QuestionFeedback
        question={cardQuestion}
        {selectedAnswer}
        correctAnswer={
          result.correctAnswer
        }
        correct={
          result.correct
        }
        explanation={
          result.explanation
        }
      />

    {/if}

     <div class="revision-controls">

  <button
    class="secondary"
    type="button"
    onclick={previousQuestion}
    disabled={currentIndex === 0}
  >
    ← Previous
  </button>


  <span class="control-status">

    {#if checking}

      Checking...

    {:else if submitted}

      Checked

    {:else}

      Question
      {currentIndex + 1}
      / {questions.length}

    {/if}

  </span>


  <button
    class="primary"
    type="button"
    onclick={primaryAction}
    disabled={
      checking ||
      (
        !submitted &&
        selectedAnswer === null
      )
    }
  >

    {#if checking}

      Checking...

    {:else if submitted}

      {isLastQuestion
        ? 'Finish Revision'
        : 'Next Question'}

    {:else}

      Submit Answer

    {/if}

  </button>

</div>


  {/if}

</div>


<style>
  .revision-player {
    width:
      min(
        calc(
          100% -
          var(--page-gutter)
        ),
        var(--page-width)
      );

    margin-inline:
      auto;

    padding:
      var(--space-6)
      0
      var(--space-8);

    display: grid;

    gap:
      var(--space-4);
  }


  .revision-header {
    display: flex;

    align-items:
      flex-start;

    justify-content:
      space-between;

    gap:
      var(--space-6);
  }


  .eyebrow {
    margin:
      0
      0
      var(--space-1);

    color:
      var(--text-muted);

    font-size:
      var(--type-label-size);

    letter-spacing:
      var(--label-letter-spacing);

    text-transform:
      uppercase;
  }


  h1,
  h2,
  p {
    margin: 0;
  }


  h1 {
    color:
      var(--primary);

    font-size:
      var(--type-page-title-size);
  }


  .revision-header a,
  .revision-state a {
    color:
      var(--primary);

    text-decoration:
      none;
  }


  .revision-position {
    display: flex;

    justify-content:
      space-between;

    gap:
      var(--space-4);

    color:
      var(--text-muted);

    font-size:
      var(--type-label-size);
  }


  .revision-controls {
  display: grid;

  grid-template-columns:
    1fr
    auto
    1fr;

  align-items: center;

  gap:
    var(--space-4);

  padding-top:
    var(--space-4);

  border-top:
    1px solid
    var(--border-soft);
}


.revision-controls
  .secondary {
  justify-self: start;
}


.revision-controls
  .primary {
  justify-self: end;

  min-width: 150px;
}


.control-status {
  justify-self: center;

  color:
    var(--text-muted);

  font-size: 0.8rem;
}
.primary,
.secondary {
  min-height: 42px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  padding:
    0
    var(--space-4);

  border:
    1px solid
    var(--border);

  border-radius:
    var(--radius);

  font: inherit;

  cursor: pointer;
}


.primary {
  background:
    var(--primary);

  color:
    var(--primary-text);

  border-color:
    var(--primary);
}


.secondary {
  background:
    var(--surface);

  color:
    var(--text);
}


.primary:disabled,
.secondary:disabled {
  opacity: 0.4;

  cursor: not-allowed;
}

  .revision-state {
    display: grid;

    gap:
      var(--space-3);

    padding:
      var(--space-6);

    background:
      var(--surface);

    border:
      var(--border-width)
      solid
      var(--border);

    border-radius:
      var(--radius);
  }


  @media (
    max-width: 600px
  ) {


    .revision-header {
      flex-direction:
        column;
    }


    .revision-controls {
      align-items:
        stretch;

      flex-direction:
        column;
    }


    .primary {
      width: 100%;
    }
  }
  .revision-player {
  width: calc(
    100% - var(--space-8)
  );

  max-width: 1100px;

  margin-inline: auto;

  padding:
    var(--space-6)
    0
    var(--space-8);

  display: grid;

  gap: var(--space-4);
}
</style>
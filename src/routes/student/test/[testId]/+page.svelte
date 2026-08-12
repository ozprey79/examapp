<script>
  // ============================================================
  // 1. Imports
  // ============================================================

  import ExamControls from "$lib/components/exam/ExamControls.svelte";
  import ExamConfirmationDialog from "$lib/components/exam/ExamConfirmationDialog.svelte";
  import ExamHeader from "$lib/components/exam/ExamHeader.svelte";
  import QuestionCard from "$lib/components/exam/QuestionCard.svelte";
  import QuestionNavigator from "$lib/components/exam/QuestionNavigator.svelte";
  import QuestionTimeList from "$lib/components/exam/QuestionTimeList.svelte";
  import { ExamTimer } from "$lib/timers/ExamTimer.svelte.js";
  import { QuestionTimer } from "$lib/timers/QuestionTimer.svelte.js";
  import SavingPulseWave from "$lib/components/results/SavingPulseWave.svelte";

  import {
    loadAttempt,
    saveAttempt,
    clearAttempt,
  } from "$lib/storage/attemptStorage.js";

  import {
    buildQuestionResults,
    summarizeResults,
  } from "$lib/results/buildResults.js";

  import { buildAttempt } from "$lib/results/buildAttempt.js";

  import {
    getSubmissionSummary,
    lockAllAnswers,
  } from "$lib/exam/examFlow.js";

  import { formatMilliseconds } from "$lib/utils/formatDuration.js";

  // ============================================================
  // 2. Page data
  // ============================================================

  let { data } = $props();

  const scoring = data.scoring;
  const meta = data.meta;

  let questions = $state(data.questions);

  const attemptStorageKey = `mock-attempt:${meta.id ?? meta.title}`;

  // ============================================================
  // 3. Primary exam state
  // ============================================================

  let currentIndex = $state(0);

  let answersById = $state(createAnswerState());

  let submittedById = $state(createSubmissionState());

  let completed = $state(false);

  let persistenceReady = $state(false);

  let startedAt = $state(new Date().toISOString());

  let completedAt = $state(null);

  let completedAttempt = $state(null);

  let attemptSaveStatus = $state("idle");

  let attemptSaveMessage = $state("");

  let lastSaveRequestedId = $state(null);

  let confirmationMode = $state(null);

  // ============================================================
  // 4. Timer objects
  // ============================================================

  const questionTimer = new QuestionTimer(questions, questions[0].id);

  const examTimer = new ExamTimer(meta.duration_minutes, finishTest);

  // ============================================================
  // 5. Derived exam state
  // ============================================================

  let question = $derived(questions[currentIndex]);

  let selectedAnswer = $derived(answersById[question.id]);

  let currentQuestionSubmitted = $derived(submittedById[question.id]);
  let currentQuestionTime = $derived(questionTimer.formattedFor(question.id));

  let isFirstQuestion = $derived(currentIndex === 0);

  let isLastQuestion = $derived(currentIndex === questions.length - 1);

  let submittedCount = $derived(
    questions.filter((question) => submittedById[question.id]).length,
  );

  let remainingCount = $derived(questions.length - submittedCount);

  let submissionSummary = $derived(
    getSubmissionSummary(questions, answersById),
  );

  let finishConfirmationDescription = $derived(
    submissionSummary.unanswered > 0
      ? `${submissionSummary.unanswered} unanswered ${submissionSummary.unanswered === 1 ? "question" : "questions"} will be recorded as skipped. Answers cannot be changed after submission.`
      : "All questions have an answer. Answers cannot be changed after submission.",
  );

  let progressPercent = $derived(
    questions.length > 0 ? (submittedCount / questions.length) * 100 : 0,
  );

  // ============================================================
  // 6. Attempt persistence
  // ============================================================

  // Restore a previously saved attempt once.
  $effect(() => {
    if (persistenceReady) {
      return;
    }

    const savedAttempt = loadAttempt(attemptStorageKey);

    if (savedAttempt !== null) {
      restoreAttempt(savedAttempt);
    }

    persistenceReady = true;
  });

  // Automatically save the active attempt.
  $effect(() => {
    if (!persistenceReady || completed) {
      return;
    }

    // Reading this value makes the effect run
    // whenever the exam clock changes.
    const clockTick = examTimer.remainingSeconds;

    const attempt = {
      version: 1,

      savedAt: new Date().toISOString(),

      questionIds: questions.map((question) => question.id),

      currentQuestionId: question.id,

      answersById: $state.snapshot(answersById),

      submittedById: $state.snapshot(submittedById),

      examTimer: examTimer.snapshot(),

      questionTimer: questionTimer.snapshot(),
    };

    saveAttempt(attemptStorageKey, attempt);
  });
  $effect(() => {
    const attempt = completedAttempt;

    if (attempt === null || attempt.attemptId === lastSaveRequestedId) {
      return;
    }

    lastSaveRequestedId = attempt.attemptId;

    void saveAttemptToDatabase(attempt);
  });

  // ============================================================
  // 7. State factory functions
  // ============================================================

  function createAnswerState() {
    const answerState = {};

    questions.forEach((question) => {
      answerState[question.id] = null;
    });

    return answerState;
  }

  function createSubmissionState() {
    const submissionState = {};

    questions.forEach((question) => {
      submissionState[question.id] = false;
    });

    return submissionState;
  }

  // ============================================================
  // 8. Attempt restoration
  // ============================================================

  function restoreQuestionOrder(savedQuestionIds) {
    if (!Array.isArray(savedQuestionIds)) {
      return;
    }

    const questionsById = new Map(
      data.questions.map((question) => [question.id, question]),
    );

    const restoredQuestions = savedQuestionIds
      .map((questionId) => questionsById.get(questionId))
      .filter(Boolean);

    const restoredIds = new Set(
      restoredQuestions.map((question) => question.id),
    );

    const newQuestions = data.questions.filter(
      (question) => !restoredIds.has(question.id),
    );

    questions = [...restoredQuestions, ...newQuestions];
  }

  function restoreAttempt(savedAttempt) {
    if (savedAttempt?.version !== 1) {
      return false;
    }

    restoreQuestionOrder(savedAttempt.questionIds);

    const freshAnswers = createAnswerState();

    const freshSubmissions = createSubmissionState();

    questions.forEach((question) => {
      const savedAnswer = savedAttempt.answersById?.[question.id];

      if (savedAnswer === null || Number.isInteger(savedAnswer)) {
        freshAnswers[question.id] = savedAnswer;
      }

      freshSubmissions[question.id] =
        savedAttempt.submittedById?.[question.id] === true;
    });

    answersById = freshAnswers;

    submittedById = freshSubmissions;

    const savedCurrentQuestionId = savedAttempt.currentQuestionId;

    const savedIndex = questions.findIndex(
      (question) => question.id === savedCurrentQuestionId,
    );

    currentIndex = savedIndex >= 0 ? savedIndex : 0;

    completed = false;

    const hasTimeRemaining = examTimer.restore(savedAttempt.examTimer);

    const currentQuestionId = questions[currentIndex].id;

    const shouldTimeCurrentQuestion =
      hasTimeRemaining && !submittedById[currentQuestionId];

    questionTimer.restore(
      savedAttempt.questionTimer,
      currentQuestionId,
      shouldTimeCurrentQuestion,
    );

    if (!hasTimeRemaining) {
      finishTest();
    }

    return true;
  }

  // ============================================================
  // 9. Answer actions
  // ============================================================

  function selectAnswer(index) {
    if (currentQuestionSubmitted || completed) {
      return;
    }

    answersById[question.id] = index;
  }

  function clearAnswer() {
    if (currentQuestionSubmitted || completed) {
      return;
    }

    answersById[question.id] = null;
  }
  function submitAnswer() {
    if (selectedAnswer === null || currentQuestionSubmitted) {
      return;
    }

    questionTimer.stopCurrent();

    submittedById[question.id] = true;
  }

  function skipQuestion() {
    if (currentQuestionSubmitted) {
      return;
    }

    questionTimer.stopCurrent();

    answersById[question.id] = null;

    submittedById[question.id] = true;
  }

  // ============================================================
  // 10. Navigation actions
  // ============================================================

  function goToQuestion(index) {
    if (completed || index === currentIndex) {
      return;
    }

    moveToQuestion(index);
  }

  function moveToQuestion(index) {
    const destinationQuestion = questions[index];

    const shouldStartTiming = !submittedById[destinationQuestion.id];

    questionTimer.switchTo(destinationQuestion.id, shouldStartTiming);

    currentIndex = index;
  }

  function previousQuestion() {
    if (isFirstQuestion) {
      return;
    }

    moveToQuestion(currentIndex - 1);
  }

  function primaryQuestionAction() {
    if (completed) {
      return;
    }

    if (isLastQuestion) {
      requestFinish();
      return;
    }

    if (!currentQuestionSubmitted) {
      if (selectedAnswer === null) {
        skipQuestion();
      } else {
        submitAnswer();
      }
    }

    moveToQuestion(currentIndex + 1);
  }

  function getQuestionStatus(navigationQuestion, index) {
    if (index === currentIndex) {
      return "Current";
    }

    if (!submittedById[navigationQuestion.id]) {
      return "Open";
    }

    if (answersById[navigationQuestion.id] === null) {
      return "Skipped";
    }

    return "Submitted";
  }

  // ============================================================
  // 11. Test lifecycle actions
  // ============================================================
  async function saveAttemptToDatabase(attempt) {
    attemptSaveStatus = "saving";

    attemptSaveMessage = "Saving your result...";

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(attempt),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error ?? "Could not save the result.");
      }

      attemptSaveStatus = "saved";

      attemptSaveMessage = "Result saved successfully.";

      window.location.href = `/student/results/${encodeURIComponent(
        attempt.attemptId,
      )}`;
    } catch (error) {
      console.error("Attempt request failed:", error);

      attemptSaveStatus = "error";

      attemptSaveMessage =
        error instanceof Error ? error.message : "Could not save the result.";
    }
  }
  function requestRestart() {
    if (!completed) {
      confirmationMode = "restart";
    }
  }

  function requestFinish() {
    if (!completed) {
      confirmationMode = "finish";
    }
  }

  function cancelConfirmation() {
    confirmationMode = null;
  }

  function confirmPendingAction() {
    const pendingAction = confirmationMode;

    confirmationMode = null;

    if (pendingAction === "restart") {
      restartTest();
      return;
    }

    if (pendingAction === "finish") {
      finishTest({ commitOpenAnswers: true });
    }
  }

  function finishTest({ commitOpenAnswers = false } = {}) {
    if (completed) {
      return;
    }

    confirmationMode = null;

    if (commitOpenAnswers) {
      submittedById = lockAllAnswers(questions, submittedById);
    }

    questionTimer.stopCurrent();
    examTimer.stop();

    const finalQuestionResults = buildQuestionResults({
      questions,
      answersById,
      submittedById,
      timeById: questionTimer.timeById,
    });

    const finalResults = summarizeResults(finalQuestionResults, scoring);

    const finishedAt = new Date().toISOString();

    completedAt = finishedAt;

    completed = true;

    completedAttempt = buildAttempt({
      meta,
      results: finalResults,
      questionResults: finalQuestionResults,
      startedAt,
      completedAt: finishedAt,
    });

    clearAttempt(attemptStorageKey);
  }

  function restartTest() {
    confirmationMode = null;

    clearAttempt(attemptStorageKey);

    currentIndex = 0;

    answersById = createAnswerState();

    submittedById = createSubmissionState();

    completed = false;

    startedAt = new Date().toISOString();

    completedAt = null;

    completedAttempt = null;

    attemptSaveStatus = "idle";

    attemptSaveMessage = "";

    lastSaveRequestedId = null;

    questionTimer.reset(questions[0].id);

    examTimer.restart();
  }
</script>

<!-- ============================================================
     12. Page interface
============================================================ -->

<div class="exam-page">
  {#if completed}
    <section class="completion-state">
      <p class="eyebrow">Completed test</p>

      <h1>
        {meta.title}
      </h1>

      {#if attemptSaveStatus === "saving"}
         <SavingPulseWave />
      {:else if attemptSaveStatus === "error"}
        <p>
          {attemptSaveMessage}
        </p>

        <button
          type="button"
          onclick={() => {
            if (completedAttempt) {
              saveAttemptToDatabase(completedAttempt);
            }
          }}
        >
          Retry Save
        </button>
      {:else}
         <SavingPulseWave />
      {/if}
    </section>
  {:else}
    <header class="test-titlebar">
      <div class="title-group">
        <p class="eyebrow">Mock Test</p>

        <h1>
          {meta.title}
        </h1>

        <p class="test-summary">
          {questions.length}
          questions ·
          {meta.duration_minutes}
          minutes
        </p>
      </div>

      <button class="restart-button" type="button" onclick={requestRestart}>
        Restart
      </button>
    </header>

    <ExamHeader
      formattedTime={examTimer.formattedTime}
      formattedQuestionTime={currentQuestionTime}
      currentQuestionNumber={currentIndex + 1}
      totalQuestions={questions.length}
    />

    <section class="progress-panel" aria-label="Test progress">
      <div class="progress-info">
        <span> Progress </span>

        <span>
          {submittedCount}
          / {questions.length}
        </span>
      </div>

      <div class="progress-track">
        <div class="progress-fill" style={`width: ${progressPercent}%`}></div>
      </div>

      <div class="progress-summary">
        <span>
          {submittedCount}
          completed
        </span>

        <span>
          {remainingCount}
          remaining
        </span>
      </div>
    </section>

    <QuestionNavigator
      {questions}
      {currentIndex}
      {getQuestionStatus}
      onGoToQuestion={goToQuestion}
    />

    <QuestionTimeList
      {questions}
      getFormattedTime={questionTimer.formattedFor.bind(questionTimer)}
    />

    <QuestionCard
      {question}
      {selectedAnswer}
      submitted={currentQuestionSubmitted}
      onSelectAnswer={selectAnswer}
    />

    <ExamControls
      hasAnswer={selectedAnswer !== null}
      submitted={currentQuestionSubmitted}
      canGoPrevious={!isFirstQuestion}
      {isLastQuestion}
      onPrevious={previousQuestion}
      onClear={clearAnswer}
      onPrimary={primaryQuestionAction}
    />
  {/if}
</div>

<ExamConfirmationDialog
  open={confirmationMode !== null}
  title={confirmationMode === "restart"
    ? "Restart this test?"
    : "Submit this test?"}
  description={confirmationMode === "restart"
    ? "Your answers and recorded question time will be cleared. This action cannot be undone."
    : finishConfirmationDescription}
  details={confirmationMode === "restart"
    ? [
        {
          label: "Completed",
          value: `${submittedCount} / ${questions.length}`,
        },
        {
          label: "Time left",
          value: examTimer.formattedTime,
        },
      ]
    : [
        {
          label: "Answered",
          value: `${submissionSummary.answered} / ${submissionSummary.total}`,
        },
        {
          label: "Unanswered",
          value: submissionSummary.unanswered,
        },
      ]}
  confirmLabel={confirmationMode === "restart"
    ? "Restart test"
    : "Submit test"}
  cancelLabel={confirmationMode === "restart"
    ? "Keep test"
    : "Continue test"}
  tone={confirmationMode === "restart" ? "destructive" : "default"}
  onConfirm={confirmPendingAction}
  onCancel={cancelConfirmation}
/>

<style>
  .exam-page {
    width: min(calc(100% - 32px), var(--page-width));

    margin-inline: auto;

    padding: var(--space-6) 0 var(--space-8);
  }

  .test-titlebar,
  .page-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);

    margin-bottom: var(--space-4);
  }

  .title-group {
    min-width: 0;
  }

  .eyebrow {
    margin: 0 0 var(--space-1);

    color: var(--text-muted);

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;

    text-transform: uppercase;
  }

  h1 {
    margin: 0;

    color: var(--primary);

    font-size: 20px;
    line-height: 1.3;
    font-weight: 600;
  }

  .test-summary {
    margin: var(--space-1) 0 0;

    color: var(--text-muted);

    font-size: 13px;
  }

  .restart-button {
    flex: 0 0 auto;

    min-height: 40px;

    padding: 0 var(--space-4);

    background: var(--surface);
    color: var(--text);

    border: 1px solid var(--border);

    border-radius: var(--radius);
  }

  .restart-button:hover {
    background: var(--surface-hover);
  }

  .progress-panel {
    margin-top: var(--space-4);

    padding: 12px 14px;

    background: var(--surface);

    border: 1px solid var(--border);

    border-radius: var(--radius);
  }

  .progress-info,
  .progress-summary {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .progress-info {
    margin-bottom: var(--space-2);

    font-size: 12px;
    font-weight: 600;
  }

  .progress-info span:last-child,
  .progress-summary {
    color: var(--text-muted);
  }

  .progress-track {
    height: 6px;

    overflow: hidden;

    background: var(--surface-strong);

    border: 1px solid var(--border-soft);

    border-radius: 999px;
  }

  .progress-fill {
    height: 100%;

    background: var(--primary);

    border-radius: inherit;

    transition: width 160ms ease;
  }

  .progress-summary {
    margin-top: var(--space-2);

    font-size: 11px;
  }

  @media (max-width: 600px) {
    .exam-page {
      width: calc(100% - 20px);

      padding-top: var(--space-4);
    }

    .test-titlebar {
      gap: var(--space-4);
    }

    h1 {
      font-size: 18px;
    }

    .restart-button {
      min-height: 36px;

      padding-inline: var(--space-3);

      font-size: 12px;
    }
  }
</style>

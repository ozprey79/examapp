export function buildAttempt({
  meta,
  results,
  questionResults,
  startedAt,
  completedAt
}) {
  return {
    attemptId: createAttemptId(),

    testId:
      meta.id ?? null,

    testTitle:
      meta.title,

    startedAt,

    completedAt,

    durationMilliseconds:
      results.totalTimeMilliseconds,

    score:
      results.score,

    correct:
      results.correct,

    wrong:
      results.wrong,

    skipped:
      results.skipped,

    totalQuestions:
      results.totalQuestions,

    answers:
      questionResults.map(
        (result) => ({
          questionId:
            result.id,

          questionNumber:
            result.number,

          selectedAnswer:
            result.selectedAnswer,

          correctAnswer:
            result.correctAnswer,

          status:
            result.status,

          timeMilliseconds:
            result.timeMilliseconds ?? 0
        })
      )
  };
}


function createAttemptId() {
  return crypto.randomUUID();
}
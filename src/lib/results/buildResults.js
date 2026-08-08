export function buildQuestionResults({
  questions,
  answersById,
  submittedById,
  timeById
}) {
  return questions.map((question, index) => {
    const selectedAnswer =
      answersById[question.id];

    const wasSubmitted =
      submittedById[question.id];

    let status;

    if (
      !wasSubmitted ||
      selectedAnswer === null
    ) {
      status = "skipped";
    } else if (
      selectedAnswer === question.a
    ) {
      status = "correct";
    } else {
      status = "wrong";
    }

    return {
      number: index + 1,

      id: question.id,

      module: question.m,
      subtopic: question.s,
      difficulty: question.difficulty,

      questionText: question.t,
      options: question.o,

      selectedAnswer,
      correctAnswer: question.a,

      explanation: question.e,

      status,

      timeMilliseconds:
        timeById[question.id] ?? 0
    };
  });
}

export function summarizeResults(
  questionResults,
  scoring
) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  questionResults.forEach((result) => {
    if (result.status === "correct") {
      correct = correct + 1;
    } else if (result.status === "wrong") {
      wrong = wrong + 1;
    } else {
      skipped = skipped + 1;
    }
  });

  const score =
    correct * scoring.correct +
    wrong * scoring.wrong +
    skipped * scoring.skipped;

  const totalTimeMilliseconds =
    questionResults.reduce(
      (total, result) =>
        total + result.timeMilliseconds,
      0
    );

  return {
    correct,
    wrong,
    skipped,
    score,
    totalQuestions:
      questionResults.length,

    totalTimeMilliseconds
  };
}
export function getPrimaryActionLabel({
  hasAnswer,
  submitted,
  isLastQuestion
}) {
  if (isLastQuestion) {
    return 'Finish test';
  }

  if (submitted) {
    return 'Next question';
  }

  return hasAnswer
    ? 'Submit & next'
    : 'Skip & next';
}


export function getSubmissionSummary(
  questions,
  answersById
) {
  const total =
    questions.length;

  const answered =
    questions.filter(
      (question) =>
        Number.isInteger(
          answersById[question.id]
        )
    ).length;

  return {
    total,
    answered,
    unanswered:
      total - answered
  };
}


export function lockAllAnswers(
  questions,
  submittedById
) {
  const lockedAnswers = {
    ...submittedById
  };

  for (const question of questions) {
    lockedAnswers[question.id] =
      true;
  }

  return lockedAnswers;
}

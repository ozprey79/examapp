// src/lib/server/validateQuestionBank.js

export function validateQuestionBank(
  questionBank
) {
  const errors = [];

  if (
    !questionBank ||
    typeof questionBank !== 'object' ||
    Array.isArray(questionBank)
  ) {
    return {
      valid: false,
      errors: [
        'Question bank must be a JSON object.'
      ]
    };
  }

  validateMeta(
    questionBank.meta,
    errors
  );

  validateScoring(
    questionBank.scoring,
    errors
  );

  validateQuestions(
    questionBank.questions,
    errors
  );

  return {
    valid: errors.length === 0,
    errors
  };
}


function validateMeta(
  meta,
  errors
) {
  if (
    !meta ||
    typeof meta !== 'object' ||
    Array.isArray(meta)
  ) {
    errors.push(
      'meta must be an object.'
    );

    return;
  }

  if (!isNonEmptyString(meta.id)) {
    errors.push(
      'meta.id must be a non-empty string.'
    );
  }

  if (!isNonEmptyString(meta.title)) {
    errors.push(
      'meta.title must be a non-empty string.'
    );
  }

  if (
    !Number.isInteger(
      meta.duration_minutes
    ) ||
    meta.duration_minutes <= 0
  ) {
    errors.push(
      'meta.duration_minutes must be a positive integer.'
    );
  }
}


function validateScoring(
  scoring,
  errors
) {
  if (
    !scoring ||
    typeof scoring !== 'object' ||
    Array.isArray(scoring)
  ) {
    errors.push(
      'scoring must be an object.'
    );

    return;
  }

  validateFiniteNumber(
    scoring.correct,
    'scoring.correct',
    errors
  );

  validateFiniteNumber(
    scoring.wrong,
    'scoring.wrong',
    errors
  );

  validateFiniteNumber(
    scoring.skipped,
    'scoring.skipped',
    errors
  );
}


function validateQuestions(
  questions,
  errors
) {
  if (!Array.isArray(questions)) {
    errors.push(
      'questions must be an array.'
    );

    return;
  }

  if (questions.length === 0) {
    errors.push(
      'questions must contain at least one question.'
    );

    return;
  }

  const questionIds = new Set();

  questions.forEach(
    (question, index) => {
      validateQuestion(
        question,
        index,
        questionIds,
        errors
      );
    }
  );
}


function validateQuestion(
  question,
  index,
  questionIds,
  errors
) {
  const location =
    `questions[${index}]`;

  if (
    !question ||
    typeof question !== 'object' ||
    Array.isArray(question)
  ) {
    errors.push(
      `${location} must be an object.`
    );

    return;
  }

  if (!isNonEmptyString(question.id)) {
    errors.push(
      `${location}.id must be a non-empty string.`
    );
  } else if (
    questionIds.has(question.id)
  ) {
    errors.push(
      `${location}.id duplicates "${question.id}".`
    );
  } else {
    questionIds.add(question.id);
  }

  if (!isNonEmptyString(question.m)) {
    errors.push(
      `${location}.m must be a non-empty module code.`
    );
  }

  if (!isNonEmptyString(question.s)) {
    errors.push(
      `${location}.s must be a non-empty topic.`
    );
  }

if (
  question.difficulty !== undefined &&
  question.difficulty !== null &&
  (
    !Number.isFinite(question.difficulty) ||
    question.difficulty < 0 ||
    question.difficulty > 1
  )
) {
  errors.push(
    `Question ${index + 1}: difficulty must be between 0 and 1 when provided.`
  );
}

  if (!isNonEmptyString(question.t)) {
    errors.push(
      `${location}.t must contain question text.`
    );
  }

  if (
    question.image !== undefined &&
    question.image !== null
  ) {
    if (!isNonEmptyString(question.image)) {
      errors.push(
        `${location}.image must be a non-empty image reference when provided.`
      );
    }

    if (!isNonEmptyString(question.image_alt)) {
      errors.push(
        `${location}.image_alt is required when an image is provided.`
      );
    }
  } else if (
    question.image_alt !== undefined &&
    question.image_alt !== null &&
    !isNonEmptyString(question.image_alt)
  ) {
    errors.push(
      `${location}.image_alt must be a non-empty string when provided.`
    );
  }

  validateOptions(
    question,
    location,
    errors
  );

  if (
    question.e !== undefined &&
    question.e !== null &&
    !isNonEmptyString(question.e)
  ) {
    errors.push(
      `${location}.e must be a non-empty string when provided.`
    );
  }
}


function validateOptions(
  question,
  location,
  errors
) {
  if (!Array.isArray(question.o)) {
    errors.push(
      `${location}.o must be an array.`
    );

    return;
  }

  if (question.o.length < 2) {
    errors.push(
      `${location}.o must contain at least two options.`
    );
  }

  question.o.forEach(
    (option, optionIndex) => {
      if (!isNonEmptyString(option)) {
        errors.push(
          `${location}.o[${optionIndex}] must be a non-empty string.`
        );
      }
    }
  );

  if (!Number.isInteger(question.a)) {
    errors.push(
      `${location}.a must be an integer.`
    );

    return;
  }

  if (
    question.a < 0 ||
    question.a >= question.o.length
  ) {
    errors.push(
      `${location}.a must be a valid option index.`
    );
  }
}


function validateFiniteNumber(
  value,
  fieldName,
  errors
) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    errors.push(
      `${fieldName} must be a finite number.`
    );
  }
}


function isNonEmptyString(
  value
) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

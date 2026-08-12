// src/lib/server/questions.js

import { db } from '$lib/server/db.js';

import {
  validateQuestionBank
} from '$lib/server/validateQuestionBank.js';


export async function importQuestionBank(
  questionBank
) {
  const validation =
    validateQuestionBank(
      questionBank
    );

  if (!validation.valid) {
    return {
      success: false,
      validationErrors:
        validation.errors
    };
  }

  const client =
    await db.connect();

  try {
    await client.query('BEGIN');

    const testId =
      questionBank.meta.id;

    await upsertTest(
      client,
      questionBank
    );

    let insertedCount = 0;
    let updatedCount = 0;

    for (
      const [
        index,
        question
      ] of questionBank.questions.entries()
    ) {
      const importResult =
        await upsertQuestion(
          client,
          {
            testId,
            question,
            position:
              index + 1
          }
        );

      if (
        importResult ===
        'inserted'
      ) {
        insertedCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    await client.query('COMMIT');

    return {
      success: true,

      result: {
        testId,

        receivedCount:
          questionBank.questions.length,

        insertedCount,

        updatedCount
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');

    throw error;
  } finally {
    client.release();
  }
}


async function upsertTest(
  client,
  questionBank
) {
  await client.query(
    `
      INSERT INTO tests (
        id,
        title,
        duration_minutes,
        correct_marks,
        wrong_marks,
        skipped_marks
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      ON CONFLICT (id)
      DO UPDATE SET
        title =
          EXCLUDED.title,

        duration_minutes =
          EXCLUDED.duration_minutes,

        correct_marks =
          EXCLUDED.correct_marks,

        wrong_marks =
          EXCLUDED.wrong_marks,

        skipped_marks =
          EXCLUDED.skipped_marks,

        updated_at =
          NOW()
    `,
    [
      questionBank.meta.id,
      questionBank.meta.title,
      questionBank.meta.duration_minutes,
      questionBank.scoring.correct,
      questionBank.scoring.wrong,
      questionBank.scoring.skipped
    ]
  );
}


async function upsertQuestion(
  client,
  {
    testId,
    question,
    position
  }
) {
  const existingResult =
    await client.query(
      `
        SELECT id
        FROM questions
        WHERE id = $1
      `,
      [
        question.id
      ]
    );

  const existedBefore =
    existingResult.rowCount > 0;

  await client.query(
    `
      INSERT INTO questions (
        id,
        test_id,
        position,
        module,
        topic,
        difficulty,
        question_text,
        options,
        correct_answer,
        explanation
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8::jsonb,
        $9,
        $10
      )
      ON CONFLICT (id)
      DO UPDATE SET
        test_id =
          EXCLUDED.test_id,

        position =
          EXCLUDED.position,

        module =
          EXCLUDED.module,

        topic =
          EXCLUDED.topic,

        difficulty =
          EXCLUDED.difficulty,

        question_text =
          EXCLUDED.question_text,

        options =
          EXCLUDED.options,

        correct_answer =
          EXCLUDED.correct_answer,

        explanation =
          EXCLUDED.explanation
    `,
    [
      question.id,
      testId,
      position,
      question.m,
      question.s,
      question.difficulty,
      question.t,
      JSON.stringify(
        question.o
      ),
      question.a,
      question.e ?? null
    ]
  );

  return existedBefore
    ? 'updated'
    : 'inserted';
}

export async function getTestForStudent(
  testId
) {
  const testResult =
    await db.query(
      `
        SELECT
          id,
          title,
          duration_minutes,
          correct_marks,
          wrong_marks,
          skipped_marks
        FROM tests
        WHERE id = $1
      `,
      [
        testId
      ]
    );


  if (
    testResult.rowCount === 0
  ) {
    return null;
  }


  const questionsResult =
    await db.query(
      `
        SELECT
          id,
          module,
          topic,
          difficulty,
          question_text,
          options,
          correct_answer,
          explanation
        FROM questions
        WHERE test_id = $1
        ORDER BY position
      `,
      [
        testId
      ]
    );


  const test =
    testResult.rows[0];


  return {
    meta: {
      id:
        test.id,

      title:
        test.title,

      duration_minutes:
        test.duration_minutes
    },

    scoring: {
      correct:
        Number(
          test.correct_marks
        ),

      wrong:
        Number(
          test.wrong_marks
        ),

      skipped:
        Number(
          test.skipped_marks
        )
    },

    questions:
      questionsResult.rows.map(
        (question) => ({
          id:
            question.id,

          m:
            question.module,

          s:
            question.topic,

          difficulty:
            Number(
              question.difficulty
            ),

          t:
            question.question_text,

          o:
            question.options,

          a:
            question.correct_answer,

          e:
            question.explanation
        })
      )
  };
}
export async function getAvailableTests(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          t.id,
          t.title,
          t.duration_minutes,
          COUNT(DISTINCT q.id)::int
            AS question_count,

          COUNT(DISTINCT a.id)::int
            AS attempt_count
        FROM tests AS t

        LEFT JOIN questions AS q
          ON q.test_id = t.id

        LEFT JOIN attempts AS a
          ON a.test_id = t.id
          AND a.user_id = $1

        GROUP BY
          t.id,
          t.title,
          t.duration_minutes

        ORDER BY
          COUNT(DISTINCT a.id) = 0 DESC,
          t.created_at DESC
      `,
      [
        userId
      ]
    );


  return result.rows.map(
    (row) => ({
      id:
        row.id,

      title:
        row.title,

      durationMinutes:
        row.duration_minutes,

      questionCount:
        row.question_count,

      attemptCount:
        row.attempt_count,

      taken:
        row.attempt_count > 0
    })
  );
}



export async function getTestsForAdmin() {
  const result =
    await db.query(
      `
        SELECT
          t.id,
          t.title,
          t.duration_minutes,
          t.correct_marks,
          t.wrong_marks,
          t.skipped_marks,
          t.created_at,
          t.updated_at,
          COUNT(q.id)::int
            AS question_count
        FROM tests AS t

        LEFT JOIN questions AS q
          ON q.test_id = t.id

        GROUP BY
          t.id,
          t.title,
          t.duration_minutes,
          t.correct_marks,
          t.wrong_marks,
          t.skipped_marks,
          t.created_at,
          t.updated_at

        ORDER BY
          t.updated_at DESC,
          t.title
      `
    );


  return result.rows.map(
    (row) => ({
      id:
        row.id,

      title:
        row.title,

      durationMinutes:
        row.duration_minutes,

      correctMarks:
        Number(
          row.correct_marks
        ),

      wrongMarks:
        Number(
          row.wrong_marks
        ),

      skippedMarks:
        Number(
          row.skipped_marks
        ),

      questionCount:
        row.question_count,

      createdAt:
        row.created_at,

      updatedAt:
        row.updated_at
    })
  );
}
export async function getTestForAdmin(
  testId
) {
  const testResult =
    await db.query(
      `
        SELECT
          id,
          title,
          duration_minutes,
          correct_marks,
          wrong_marks,
          skipped_marks,
          created_at,
          updated_at
        FROM tests
        WHERE id = $1
      `,
      [
        testId
      ]
    );


  if (
    testResult.rowCount === 0
  ) {
    return null;
  }


  const questionsResult =
    await db.query(
      `
        SELECT
          id,
          position,
          module,
          topic,
          difficulty,
          question_text,
          options,
          correct_answer,
          explanation,
          created_at
        FROM questions
        WHERE test_id = $1
        ORDER BY position
      `,
      [
        testId
      ]
    );


  const test =
    testResult.rows[0];


  return {
    id:
      test.id,

    title:
      test.title,

    durationMinutes:
      test.duration_minutes,

    correctMarks:
      Number(
        test.correct_marks
      ),

    wrongMarks:
      Number(
        test.wrong_marks
      ),

    skippedMarks:
      Number(
        test.skipped_marks
      ),

    createdAt:
      test.created_at,

    updatedAt:
      test.updated_at,

    questions:
      questionsResult.rows.map(
        (row) => ({
          id:
            row.id,

          position:
            row.position,

          module:
            row.module,

          topic:
            row.topic,

          difficulty:
            Number(
              row.difficulty
            ),

          text:
            row.question_text,

          options:
            row.options,

          correctAnswer:
            row.correct_answer,

          explanation:
            row.explanation
        })
      )
  };
}


export async function updateTest(
  testId,
  {
    title,
    durationMinutes,
    correctMarks,
    wrongMarks,
    skippedMarks
  }
) {
  if (
    typeof testId !== 'string' ||
    testId.trim().length === 0
  ) {
    throw new Error(
      'Test ID is required.'
    );
  }

  if (
    typeof title !== 'string' ||
    title.trim().length === 0
  ) {
    throw new Error(
      'Test title is required.'
    );
  }

  if (
    !Number.isInteger(
      durationMinutes
    ) ||
    durationMinutes <= 0
  ) {
    throw new Error(
      'Duration must be a positive whole number.'
    );
  }

  if (
    !Number.isFinite(
      correctMarks
    ) ||
    !Number.isFinite(
      wrongMarks
    ) ||
    !Number.isFinite(
      skippedMarks
    )
  ) {
    throw new Error(
      'Scoring values are invalid.'
    );
  }


  const result =
    await db.query(
      `
        UPDATE tests

        SET
          title = $2,
          duration_minutes = $3,
          correct_marks = $4,
          wrong_marks = $5,
          skipped_marks = $6,
          updated_at = NOW()

        WHERE id = $1

        RETURNING
          id,
          title,
          duration_minutes,
          correct_marks,
          wrong_marks,
          skipped_marks,
          updated_at
      `,
      [
        testId,
        title.trim(),
        durationMinutes,
        correctMarks,
        wrongMarks,
        skippedMarks
      ]
    );


  if (
    result.rowCount === 0
  ) {
    return null;
  }


  return result.rows[0];
}

export async function updateQuestion(
  testId,
  questionId,
  {
    module,
    topic,
    difficulty,
    questionText,
    options,
    correctAnswer,
    explanation
  }
) {
  if (
    typeof module !== 'string' ||
    module.trim().length === 0
  ) {
    throw new Error(
      'Module is required.'
    );
  }


  if (
    typeof topic !== 'string' ||
    topic.trim().length === 0
  ) {
    throw new Error(
      'Topic is required.'
    );
  }


  if (
    !Number.isFinite(
      difficulty
    ) ||
    difficulty < 0 ||
    difficulty > 1
  ) {
    throw new Error(
      'Difficulty must be between 0 and 1.'
    );
  }


  if (
    typeof questionText !==
      'string' ||
    questionText.trim().length === 0
  ) {
    throw new Error(
      'Question text is required.'
    );
  }


  if (
    !Array.isArray(
      options
    ) ||
    options.length < 2
  ) {
    throw new Error(
      'At least two options are required.'
    );
  }


  const cleanedOptions =
    options.map(
      (option) =>
        String(option).trim()
    );


  if (
    cleanedOptions.some(
      (option) =>
        option.length === 0
    )
  ) {
    throw new Error(
      'Options cannot be empty.'
    );
  }


  if (
    !Number.isInteger(
      correctAnswer
    ) ||
    correctAnswer < 0 ||
    correctAnswer >=
      cleanedOptions.length
  ) {
    throw new Error(
      'Correct answer is invalid.'
    );
  }


  const result =
    await db.query(
      `
        UPDATE questions

        SET
          module = $3,
          topic = $4,
          difficulty = $5,
          question_text = $6,
          options = $7::jsonb,
          correct_answer = $8,
          explanation = $9

        WHERE
          id = $1
          AND test_id = $2

        RETURNING id
      `,
      [
        questionId,
        testId,
        module.trim(),
        topic.trim(),
        difficulty,
        questionText.trim(),
        JSON.stringify(
          cleanedOptions
        ),
        correctAnswer,
        explanation.trim().length === 0
          ? null
          : explanation.trim()
      ]
    );


  if (
    result.rowCount === 0
  ) {
    return null;
  }


  await db.query(
    `
      UPDATE tests
      SET updated_at = NOW()
      WHERE id = $1
    `,
    [
      testId
    ]
  );


  return {
    id:
      result.rows[0].id
  };
}

export async function getQuestionForAdmin(
  testId,
  questionId
) {
  const result =
    await db.query(
      `
        SELECT
          id,
          test_id,
          position,
          module,
          topic,
          difficulty,
          question_text,
          options,
          correct_answer,
          explanation
        FROM questions
        WHERE
          id = $1
          AND test_id = $2
      `,
      [
        questionId,
        testId
      ]
    );


  if (
    result.rowCount === 0
  ) {
    return null;
  }


  const row =
    result.rows[0];


  return {
    id:
      row.id,

    testId:
      row.test_id,

    position:
      row.position,

    module:
      row.module,

    topic:
      row.topic,

    difficulty:
      Number(
        row.difficulty
      ),

    text:
      row.question_text,

    options:
      row.options,

    correctAnswer:
      row.correct_answer,

    explanation:
      row.explanation ?? ''
  };
}

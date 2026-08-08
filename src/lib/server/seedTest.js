// src/lib/server/seedTest.js

import { db } from '$lib/server/db.js';

export async function seedTest(
  questionBank
) {
  const client =
    await db.connect();

  try {
    await client.query('BEGIN');

    const testId =
      questionBank.meta.id ??
      'civil-engineering-mock-test';

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
        testId,
        questionBank.meta.title,
        questionBank.meta.duration_minutes,
        questionBank.scoring.correct,
        questionBank.scoring.wrong,
        questionBank.scoring.skipped
      ]
    );

    for (
      const [
        index,
        question
      ] of questionBank.questions.entries()
    ) {
      validateDifficulty(
        question.difficulty,
        question.id
      );

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
          index + 1,
          question.m ?? null,
          question.s ?? null,
          question.difficulty,
          question.t,
          JSON.stringify(
            question.o
          ),
          question.a,
          question.e ?? null
        ]
      );
    }

    await client.query('COMMIT');

    return {
      testId,
      questionCount:
        questionBank.questions.length
    };
  } catch (error) {
    await client.query('ROLLBACK');

    throw error;
  } finally {
    client.release();
  }
}


function validateDifficulty(
  difficulty,
  questionId
) {
  if (
    typeof difficulty !== 'number' ||
    !Number.isFinite(difficulty) ||
    difficulty < 0 ||
    difficulty > 1
  ) {
    throw new Error(
      `Question ${questionId} has an invalid difficulty. ` +
      'Difficulty must be a number between 0 and 1.'
    );
  }
}
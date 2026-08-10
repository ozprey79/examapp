import { db } from '$lib/server/db';

export async function getSavedQuestion(
  userId,
  questionId
) {
  const result =
    await db.query(
      `
        SELECT
          sq.note,
          sq.created_at AS saved_at,
          q.*

        FROM
          public.student_saved_questions sq

        JOIN
          public.questions q
        ON
          q.id = sq.question_id

        WHERE
          sq.user_id = $1
          AND sq.question_id = $2

        LIMIT 1
      `,
      [
        userId,
        questionId
      ]
    );

  return (
    result.rows[0] ??
    null
  );
}
export async function isQuestionSaved(
  userId,
  questionId
) {
  const result =
    await db.query(
      `
        SELECT 1
        FROM public.student_saved_questions
        WHERE
          user_id = $1
          AND question_id = $2
        LIMIT 1
      `,
      [
        userId,
        questionId
      ]
    );

  return (
    result.rowCount > 0
  );
}


export async function saveQuestion(
  userId,
  questionId
) {
  const result =
    await db.query(
      `
        INSERT INTO
          public.student_saved_questions (
            user_id,
            question_id
          )
        VALUES (
          $1,
          $2
        )

        ON CONFLICT (
          user_id,
          question_id
        )
        DO NOTHING

        RETURNING
          user_id,
          question_id,
          note,
          created_at
      `,
      [
        userId,
        questionId
      ]
    );

  return {
    saved: true,
    created:
      result.rowCount > 0
  };
}


export async function removeSavedQuestion(
  userId,
  questionId
) {
  const result =
    await db.query(
      `
        DELETE FROM
          public.student_saved_questions
        WHERE
          user_id = $1
          AND question_id = $2
        RETURNING
          question_id
      `,
      [
        userId,
        questionId
      ]
    );

  return {
    saved: false,
    removed:
      result.rowCount > 0
  };
}


export async function getSavedQuestions(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          sq.question_id,
          sq.note,
          sq.created_at,

          q.*

        FROM
          public.student_saved_questions sq

        JOIN
          questions q
        ON
          q.id =
          sq.question_id

        WHERE
          sq.user_id = $1

        ORDER BY
          sq.created_at DESC
      `,
      [
        userId
      ]
    );

  return result.rows;
}
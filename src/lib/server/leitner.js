import { db } from '$lib/server/db.js';

function getReviewIntervalDays(box) {
  switch (box) {
    case 1:
      return 1;

    case 2:
      return 3;

    case 3:
      return 7;

    case 4:
      return 14;

    case 5:
      return 30;

    default:
      return 1;
  }
}

export async function getLeitnerVisualization(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          l.question_id,
          l.box,
          l.correct_streak,
          l.next_review_at,

          q.module,
          q.topic

        FROM
          public.student_question_leitner l

        JOIN
          public.questions q
        ON
          q.id = l.question_id

        WHERE
          l.user_id = $1

        ORDER BY
          l.box,
          l.next_review_at
      `,
      [
        userId
      ]
    );


  return result.rows.map(
    (row) => ({
      id:
        row.question_id,

      box:
        Number(row.box),

      streak:
        Number(
          row.correct_streak ?? 0
        ),

      module:
        row.module ?? '',

      topic:
        row.topic ?? '',

      due:
        row.next_review_at
          ? new Date(
              row.next_review_at
            ) <= new Date()
          : false
    })
  );
}


export async function getLeitnerPracticeSummary(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          box,
          COUNT(*)::int AS count
        FROM student_question_leitner
        WHERE user_id = $1
        GROUP BY box
        ORDER BY box
      `,
      [userId]
    );

  const boxes = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  for (const row of result.rows) {
    boxes[row.box] = row.count;
  }

  return {
    boxes,
    total:
      Object.values(boxes)
        .reduce(
          (sum, count) =>
            sum + count,
          0
        )
  };
}
export async function getPracticeQuestionsByBox(
  userId,
  box
) {
  const result =
    await db.query(
      `
        SELECT
          q.id,
          q.test_id,
          q.position,
          q.question_text,
          to_jsonb(q) ->> 'image_url' AS image_url,
          to_jsonb(q) ->> 'image_alt' AS image_alt,
          q.options,
          q.explanation,
          q.difficulty,

          l.box,
          l.correct_streak,
          l.last_reviewed_at,
          l.next_review_at

        FROM student_question_leitner AS l

        JOIN questions AS q
          ON q.id = l.question_id

        WHERE
          l.user_id = $1
          AND l.box = $2

        ORDER BY
          q.test_id,
          q.position
      `,
      [
        userId,
        box
      ]
    );

  return result.rows;
}
export async function getAllPracticeQuestions(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          q.id,
          q.test_id,
          q.position,
          q.question_text,
          to_jsonb(q) ->> 'image_url' AS image_url,
          to_jsonb(q) ->> 'image_alt' AS image_alt,
          q.options,
          q.explanation,
          q.difficulty,

          l.box,
          l.correct_streak,
          l.last_reviewed_at,
          l.next_review_at

        FROM student_question_leitner AS l

        JOIN questions AS q
          ON q.id = l.question_id

        WHERE
          l.user_id = $1

        ORDER BY
          l.box ASC,
          q.test_id,
          q.position
      `,
      [
        userId
      ]
    );

  return result.rows;
}
export async function updateLeitner({
  client,
  userId,
  questionId,
  correct
}) {
  const existing = await client.query(
    `
      SELECT
        box,
        correct_streak
      FROM student_question_leitner
      WHERE
        user_id = $1
        AND question_id = $2
    `,
    [
      userId,
      questionId
    ]
  );


  if (existing.rowCount === 0) {
    const newBox =
      correct ? 2 : 1;

    const newStreak =
      correct ? 1 : 0;

    const intervalDays =
      getReviewIntervalDays(
        newBox
      );

    await client.query(
      `
        INSERT INTO student_question_leitner (
          user_id,
          question_id,
          box,
          correct_streak,
          last_reviewed_at,
          next_review_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW() + ($5 * INTERVAL '1 day')
        )
      `,
      [
        userId,
        questionId,
        newBox,
        newStreak,
        intervalDays
      ]
    );

    return;
  }


  const current =
    existing.rows[0];

  let newBox;
  let newStreak;


  if (correct) {
    newBox =
      Math.min(
        current.box + 1,
        5
      );

    newStreak =
      current.correct_streak + 1;
  } else {
    newBox = 1;
    newStreak = 0;
  }


  const intervalDays =
    getReviewIntervalDays(
      newBox
    );


  await client.query(
    `
      UPDATE student_question_leitner
      SET
        box = $1,
        correct_streak = $2,
        last_reviewed_at = NOW(),
        next_review_at =
          NOW() + ($3 * INTERVAL '1 day')
      WHERE
        user_id = $4
        AND question_id = $5
    `,
    [
      newBox,
      newStreak,
      intervalDays,
      userId,
      questionId
    ]
  );
}


export async function getDueLeitnerQuestions(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          q.id,
          q.test_id,
          q.position,
          q.question_text,
          to_jsonb(q) ->> 'image_url' AS image_url,
          to_jsonb(q) ->> 'image_alt' AS image_alt,
          q.options,
          q.correct_answer,
          q.explanation,
          q.difficulty,

          l.box,
          l.correct_streak,
          l.last_reviewed_at,
          l.next_review_at

        FROM student_question_leitner AS l

        JOIN questions AS q
          ON q.id = l.question_id

        WHERE
          l.user_id = $1
          AND l.next_review_at <= NOW()

        ORDER BY
          l.next_review_at ASC,
          l.box ASC,
          q.position ASC
      `,
      [
        userId
      ]
    );

  return result.rows;
}

// src/lib/server/attempts.js

import { db } from '$lib/server/db.js';
import { updateLeitner } from '$lib/server/leitner';
import {
  calculateStudyStreak
} from '$lib/streaks/studyStreak.js';

export async function saveCompletedAttempt(
  attempt,
  userId
) {
  validateAttempt(attempt);

  if (
    typeof userId !== 'string' ||
    userId.length === 0
  ) {
    throw new Error(
      'Authenticated user ID is required.'
    );
  }

  const client =
    await db.connect();

  try {
    await client.query('BEGIN');


    // ----------------------------------------------------------
    // 1. Save attempt summary
    // ----------------------------------------------------------

    await client.query(
      `
        INSERT INTO attempts (
          id,
          test_id,
          user_id,
          started_at,
          completed_at,
          duration_milliseconds,
          score,
          correct_count,
          wrong_count,
          skipped_count,
          total_questions
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
      `,
      [
        attempt.attemptId,
        attempt.testId,
        userId,
        attempt.startedAt,
        attempt.completedAt,
        attempt.durationMilliseconds,
        attempt.score,
        attempt.correct,
        attempt.wrong,
        attempt.skipped,
        attempt.totalQuestions
      ]
    );


    // ----------------------------------------------------------
    // 2. Save answers + update Leitner
    // ----------------------------------------------------------

    for (
      const answer of attempt.answers
    ) {
      const status =
        normalizeStatus(
          answer.status
        );

      await client.query(
        `
          INSERT INTO attempt_answers (
            attempt_id,
            question_id,
            selected_answer,
            correct_answer,
            status,
            time_milliseconds
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
        `,
        [
          attempt.attemptId,
          answer.questionId,
          answer.selectedAnswer,
          answer.correctAnswer,
          status,
          answer.timeMilliseconds
        ]
      );


      await updateLeitner({
        client,
        userId,
        questionId:
          answer.questionId,
        correct:
          status === 'correct'
      });
    }


    // ----------------------------------------------------------
    // 3. Commit everything together
    // ----------------------------------------------------------

    await client.query(
      'COMMIT'
    );


    return {
      attemptId:
        attempt.attemptId,

      savedAnswers:
        attempt.answers.length
    };

  } catch (error) {

    await client.query(
      'ROLLBACK'
    );

    throw error;

  } finally {

    client.release();

  }
}
// ============================================================
// Attempt history
// ============================================================

export async function getAttemptHistory() {
  const result =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at
        FROM attempts AS a
        JOIN tests AS t
          ON t.id = a.test_id
        ORDER BY
          a.completed_at DESC
      `
    );

  return result.rows.map(
    mapAttemptRow
  );
}


export async function getAttemptHistoryForUser(
  userId
) {
  const result =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at
        FROM attempts AS a
        JOIN tests AS t
          ON t.id = a.test_id
        WHERE a.user_id = $1
        ORDER BY
          a.completed_at DESC
      `,
      [
        userId
      ]
    );

  return result.rows.map(
    mapAttemptRow
  );
}
export async function getStudentProgressForAdmin() {
  const result =
    await db.query(
      `
        SELECT
          u.id AS user_id,
          u.name,
          u.email,
          up.display_name,

          COUNT(a.id)::int
            AS attempt_count,

          AVG(a.score)
            AS average_score,

          MAX(a.score)
            AS best_score,

          MAX(a.completed_at)
            AS last_attempt_at,

          (
            SELECT a2.score
            FROM attempts AS a2
            WHERE a2.user_id = u.id
            ORDER BY
              a2.completed_at DESC
            LIMIT 1
          ) AS latest_score

        FROM "user" AS u

        JOIN user_profiles AS up
          ON up.user_id = u.id

        LEFT JOIN attempts AS a
          ON a.user_id = u.id

        WHERE up.role = 'student'

        GROUP BY
          u.id,
          u.name,
          u.email,
          up.display_name

        ORDER BY
          COALESCE(
            MAX(a.completed_at),
            u."createdAt"
          ) DESC
      `
    );

  return result.rows.map(
    (row) => ({
      userId:
        row.user_id,

      name:
        row.display_name ??
        row.name ??
        'Student',

      email:
        row.email,

      attemptCount:
        row.attempt_count,

      latestScore:
        row.latest_score === null
          ? null
          : Number(row.latest_score),

      bestScore:
        row.best_score === null
          ? null
          : Number(row.best_score),

      averageScore:
        row.average_score === null
          ? null
          : Number(row.average_score),

      lastAttemptAt:
        row.last_attempt_at
    })
  );
}
export async function getAttemptById(
  attemptId
) {
  const attemptResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at
        FROM attempts AS a
        JOIN tests AS t
          ON t.id = a.test_id
        WHERE a.id = $1
      `,
      [
        attemptId
      ]
    );

  if (
    attemptResult.rowCount === 0
  ) {
    return null;
  }

  const answersResult =
    await db.query(
      `
        SELECT
          aa.question_id,
          q.position AS question_number,
          q.question_text,
          to_jsonb(q) ->> 'image_url' AS image_url,
          to_jsonb(q) ->> 'image_alt' AS image_alt,
          aa.selected_answer,
          aa.correct_answer,
          aa.status,
          aa.time_milliseconds,
          q.explanation
        FROM attempt_answers AS aa
        JOIN questions AS q
          ON q.id = aa.question_id
        WHERE aa.attempt_id = $1
        ORDER BY
          q.position
      `,
      [
        attemptId
      ]
    );

  return {
    ...mapAttemptRow(
      attemptResult.rows[0]
    ),

    answers:
      answersResult.rows.map(
        mapAnswerRow
      )
  };
}
export async function getAttemptByIdForUser(
  attemptId,
  userId
) {
  const attemptResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at

        FROM attempts AS a

        JOIN tests AS t
          ON t.id = a.test_id

        WHERE
          a.id = $1
          AND a.user_id = $2
      `,
      [
        attemptId,
        userId
      ]
    );


  if (
    attemptResult.rowCount === 0
  ) {
    return null;
  }


const answersResult =
  await db.query(
    `
      SELECT
        aa.question_id,

        q.position
          AS question_number,

        q.module,
        q.topic,

        q.question_text,
        to_jsonb(q) ->> 'image_url' AS image_url,
        to_jsonb(q) ->> 'image_alt' AS image_alt,
        q.options,
        q.difficulty,

        aa.selected_answer,
        aa.correct_answer,
        aa.status,
        aa.time_milliseconds,

        q.explanation

      FROM attempt_answers AS aa

      JOIN questions AS q
        ON q.id = aa.question_id

      WHERE
        aa.attempt_id = $1

      ORDER BY
        q.position
    `,
    [
      attemptId
    ]
  );

  return {
    ...mapAttemptRow(
      attemptResult.rows[0]
    ),

    answers:
  answersResult.rows.map(
    (row) => ({
      ...mapAnswerRow(row),

      module:
        row.module,

      topic:
        row.topic,

      options:
        row.options,

      difficulty:
        row.difficulty === null
          ? null
          : Number(
              row.difficulty
            )
    })
  )
 };
}
export async function getStudentAttemptForAdmin(
  userId,
  attemptId
) {
  const attemptResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          a.user_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at
        FROM attempts AS a
        JOIN tests AS t
          ON t.id = a.test_id
        WHERE
          a.id = $1
          AND a.user_id = $2
      `,
      [
        attemptId,
        userId
      ]
    );

  if (
    attemptResult.rowCount === 0
  ) {
    return null;
  }


  const answersResult =
    await db.query(
      `
        SELECT
          aa.question_id,
          q.position AS question_number,
          q.question_text,
          to_jsonb(q) ->> 'image_url' AS image_url,
          to_jsonb(q) ->> 'image_alt' AS image_alt,
          q.options,
          aa.selected_answer,
          aa.correct_answer,
          aa.status,
          aa.time_milliseconds,
          q.explanation
        FROM attempt_answers AS aa
        JOIN questions AS q
          ON q.id = aa.question_id
        WHERE aa.attempt_id = $1
        ORDER BY
          q.position
      `,
      [
        attemptId
      ]
    );


  return {
    ...mapAttemptRow(
      attemptResult.rows[0]
    ),

    answers:
      answersResult.rows.map(
        (row) => ({
          ...mapAnswerRow(row),

          options:
            row.options
        })
      )
  };
}
export async function getStudentAttemptsForAdmin(
  userId
) {
  const studentResult =
    await db.query(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          up.display_name
        FROM "user" AS u
        JOIN user_profiles AS up
          ON up.user_id = u.id
        WHERE
          u.id = $1
          AND up.role = 'student'
      `,
      [
        userId
      ]
    );

  if (
    studentResult.rowCount === 0
  ) {
    return null;
  }


  const attemptsResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title AS test_title,
          a.started_at,
          a.completed_at,
          a.duration_milliseconds,
          a.score,
          a.correct_count,
          a.wrong_count,
          a.skipped_count,
          a.total_questions,
          a.created_at
        FROM attempts AS a
        JOIN tests AS t
          ON t.id = a.test_id
        WHERE a.user_id = $1
        ORDER BY
          a.completed_at DESC
      `,
      [
        userId
      ]
    );


  const student =
    studentResult.rows[0];


  return {
    student: {
      id:
        student.id,

      name:
        student.display_name ??
        student.name ??
        'Student',

      email:
        student.email
    },

    attempts:
      attemptsResult.rows.map(
        mapAttemptRow
      )
  };
}
//student dashboard

export async function getStudentDashboardSummary(
  userId
) {
  // ----------------------------------------------------------
  // 1. General summary
  // ----------------------------------------------------------

  const summaryResult =
    await db.query(
      `
        SELECT
          COUNT(id)::int
            AS attempt_count,

          MAX(completed_at)
            AS last_attempt_at

        FROM attempts

        WHERE user_id = $1
      `,
      [
        userId
      ]
    );


  // ----------------------------------------------------------
  // Daily streak activity
  // One or more completed tests on a local calendar day count
  // as a single active day.
  // ----------------------------------------------------------

  const streakResult =
    await db.query(
      `
        SELECT
          completed_at

        FROM attempts

        WHERE user_id = $1

        ORDER BY
          completed_at ASC
      `,
      [
        userId
      ]
    );


  // ----------------------------------------------------------
  // 2. Recent attempts
  //    Used by the RESULTS table
  //    newest first
  // ----------------------------------------------------------

  const recentResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title
            AS test_title,

          a.started_at,
          a.completed_at,
          a.duration_milliseconds,

          a.score,

          a.correct_count,
          a.wrong_count,
          a.skipped_count,

          a.total_questions,

          a.created_at

        FROM attempts AS a

        JOIN tests AS t
          ON t.id = a.test_id

        WHERE a.user_id = $1

        ORDER BY
          a.completed_at DESC

        LIMIT 5
      `,
      [
        userId
      ]
    );


  // ----------------------------------------------------------
  // 3. Progress attempts
  //    Used by AttemptProgressEqualizer
  //
  //    IMPORTANT:
  //    total_questions MUST be included here.
  // ----------------------------------------------------------

  const progressResult =
    await db.query(
      `
        SELECT
          a.id,
          a.test_id,
          t.title
            AS test_title,

          a.started_at,
          a.completed_at,
          a.duration_milliseconds,

          a.score,

          a.correct_count,
          a.wrong_count,
          a.skipped_count,

          a.total_questions,

          a.created_at

        FROM attempts AS a

        JOIN tests AS t
          ON t.id = a.test_id

        WHERE a.user_id = $1

        ORDER BY
          a.completed_at DESC

        LIMIT 18
      `,
      [
        userId
      ]
    );


  const summary =
    summaryResult.rows[0];


  /*
    SQL returned newest -> oldest.

    The equalizer expects:
    oldest -> newest

    so reverse only the progress array.
  */

  const progressAttempts =
    progressResult.rows
      .map(
        mapAttemptRow
      )
      .reverse();


  const streak =
    calculateStudyStreak(
      streakResult.rows.map(
        (row) =>
          row.completed_at
      )
    );


  return {
    attemptCount:
      summary.attempt_count,

    lastAttemptAt:
      summary.last_attempt_at,

    streak,

    recentAttempts:
      recentResult.rows.map(
        mapAttemptRow
      ),

    progressAttempts
  };
}
// ============================================================
// Validation
// ============================================================

function validateAttempt(
  attempt
) {
  if (
    !attempt ||
    typeof attempt !== 'object'
  ) {
    throw new Error(
      'Attempt payload is missing.'
    );
  }

  if (
    typeof attempt.attemptId !==
      'string' ||
    attempt.attemptId.length === 0
  ) {
    throw new Error(
      'Attempt ID is invalid.'
    );
  }

  if (
    typeof attempt.testId !==
      'string' ||
    attempt.testId.length === 0
  ) {
    throw new Error(
      'Test ID is invalid.'
    );
  }

  if (
    !Array.isArray(
      attempt.answers
    )
  ) {
    throw new Error(
      'Attempt answers must be an array.'
    );
  }

  if (
    attempt.answers.length !==
    attempt.totalQuestions
  ) {
    throw new Error(
      'Answer count does not match total questions.'
    );
  }

  const countTotal =
    attempt.correct +
    attempt.wrong +
    attempt.skipped;

  if (
    countTotal !==
    attempt.totalQuestions
  ) {
    throw new Error(
      'Result counts do not match total questions.'
    );
  }

  if (
    !Number.isFinite(
      attempt.durationMilliseconds
    ) ||
    attempt.durationMilliseconds < 0
  ) {
    throw new Error(
      'Attempt duration is invalid.'
    );
  }

  if (
    !Number.isFinite(
      attempt.score
    )
  ) {
    throw new Error(
      'Attempt score is invalid.'
    );
  }

  for (
    const answer of attempt.answers
  ) {
    validateAnswer(
      answer
    );
  }
}


function validateAnswer(
  answer
) {
  if (
    !answer ||
    typeof answer !== 'object'
  ) {
    throw new Error(
      'An attempt answer is invalid.'
    );
  }

  if (
    typeof answer.questionId !==
      'string' ||
    answer.questionId.length === 0
  ) {
    throw new Error(
      'Question ID is invalid.'
    );
  }

  if (
    answer.selectedAnswer !== null &&
    !Number.isInteger(
      answer.selectedAnswer
    )
  ) {
    throw new Error(
      `Selected answer for ${answer.questionId} is invalid.`
    );
  }

  if (
    !Number.isInteger(
      answer.correctAnswer
    )
  ) {
    throw new Error(
      `Correct answer for ${answer.questionId} is invalid.`
    );
  }

  if (
    !Number.isFinite(
      answer.timeMilliseconds
    ) ||
    answer.timeMilliseconds < 0
  ) {
    throw new Error(
      `Time for ${answer.questionId} is invalid.`
    );
  }

  normalizeStatus(
    answer.status
  );
}


function normalizeStatus(
  status
) {
  const normalized =
    String(status)
      .trim()
      .toLowerCase();

  if (
    normalized !== 'correct' &&
    normalized !== 'wrong' &&
    normalized !== 'skipped'
  ) {
    throw new Error(
      `Invalid answer status: ${status}`
    );
  }

  return normalized;
}


// ============================================================
// Database row mapping
// ============================================================

function mapAttemptRow(
  row
) {
  return {
    id:
      row.id,

    testId:
      row.test_id,

    testTitle:
      row.test_title,

    startedAt:
      row.started_at,

    completedAt:
      row.completed_at,

    durationMilliseconds:
      row.duration_milliseconds,

    score:
      Number(
        row.score
      ),

    correct:
      row.correct_count,

    wrong:
      row.wrong_count,

    skipped:
      row.skipped_count,

    totalQuestions:
      row.total_questions,

    createdAt:
      row.created_at
  };
}


function mapAnswerRow(
  row
) {
  return {
    questionId:
      row.question_id,

    questionNumber:
      row.question_number,

    questionText:
      row.question_text,

    image:
      row.image_url,

    imageAlt:
      row.image_alt,

    selectedAnswer:
      row.selected_answer,

    correctAnswer:
      row.correct_answer,

    status:
      row.status,

    timeMilliseconds:
      row.time_milliseconds,

    explanation:
      row.explanation
  };
}

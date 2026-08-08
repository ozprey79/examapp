import { fail } from '@sveltejs/kit';
import {
  getDueLeitnerQuestions,
  updateLeitner
} from '$lib/server/leitner.js';

import { db } from '$lib/server/db.js';


export async function load({ locals }) {
  const userId = locals.user.id;

  const questions =
    await getDueLeitnerQuestions(userId);

  return {
    questions
  };
}


export const actions = {
  answer: async ({ request, locals }) => {
  const userId =
    locals.user.id;

  const formData =
    await request.formData();

  const questionId =
    formData.get('questionId');

  const selectedAnswerRaw =
    formData.get('selectedAnswer');


  if (
    typeof questionId !== 'string' ||
    questionId.length === 0
  ) {
    return fail(400, {
      message:
        'Question ID is missing.'
    });
  }


  const selectedAnswer =
    Number(selectedAnswerRaw);


  if (
    !Number.isInteger(
      selectedAnswer
    )
  ) {
    return fail(400, {
      message:
        'Selected answer is invalid.'
    });
  }


  const client =
    await db.connect();

  try {
    await client.query(
      'BEGIN'
    );


    // --------------------------------------------------------
    // 1. Get the real answer from PostgreSQL
    // --------------------------------------------------------

    const questionResult =
      await client.query(
        `
          SELECT
            correct_answer
          FROM questions
          WHERE id = $1
        `,
        [
          questionId
        ]
      );


    if (
      questionResult.rowCount === 0
    ) {
      await client.query(
        'ROLLBACK'
      );

      return fail(404, {
        message:
          'Question not found.'
      });
    }


    const correctAnswer =
      questionResult.rows[0]
        .correct_answer;


    // --------------------------------------------------------
    // 2. Server decides correctness
    // --------------------------------------------------------

    const correct =
      selectedAnswer ===
      correctAnswer;


    // --------------------------------------------------------
    // 3. Update Leitner
    // --------------------------------------------------------

    await updateLeitner({
      client,
      userId,
      questionId,
      correct
    });


    await client.query(
      'COMMIT'
    );


    return {
      success: true,
      correct,
      correctAnswer
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
};
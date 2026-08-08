import { error, fail } from '@sveltejs/kit';

import {
  getAllPracticeQuestions,
  getPracticeQuestionsByBox
} from '$lib/server/leitner.js';

import { db } from '$lib/server/db.js';


export async function load({
  params,
  locals
}) {
  const userId =
    locals.user.id;

  const { mode } = params;


  if (mode === 'all') {
    const questions =
      await getAllPracticeQuestions(
        userId
      );

    return {
      title: 'All Learned Questions',
      questions
    };
  }


  if (
    mode.startsWith('box-')
  ) {
    const box =
      Number(
        mode.replace(
          'box-',
          ''
        )
      );

    if (
      !Number.isInteger(box) ||
      box < 1 ||
      box > 5
    ) {
      throw error(
        404,
        'Invalid revision box'
      );
    }

    const questions =
      await getPracticeQuestionsByBox(
        userId,
        box
      );

    return {
      title:
        `Box ${box} Practice`,

      questions
    };
  }


  throw error(
    404,
    'Revision mode not found'
  );
}

export const actions = {
  answer: async ({
    request,
    locals
  }) => {
    const userId =
      locals.user.id;

    const formData =
      await request.formData();

    const questionId =
      formData.get(
        'questionId'
      );

    const selectedRaw =
      formData.get(
        'selectedAnswer'
      );


    if (
      typeof questionId !==
        'string' ||
      questionId.length === 0
    ) {
      return fail(400, {
        message:
          'Question ID is missing.'
      });
    }


    const selectedAnswer =
      Number(selectedRaw);


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


    const result =
      await db.query(
        `
          SELECT
            q.correct_answer,
            q.explanation

          FROM questions AS q

          JOIN student_question_leitner AS l
            ON l.question_id = q.id

          WHERE
            q.id = $1
            AND l.user_id = $2
        `,
        [
          questionId,
          userId
        ]
      );


    if (
      result.rowCount === 0
    ) {
      return fail(404, {
        message:
          'Question not found.'
      });
    }


    const question =
      result.rows[0];

    const correct =
      selectedAnswer ===
      question.correct_answer;


    return {
      success: true,
      correct,
      correctAnswer:
        question.correct_answer,
      explanation:
        question.explanation
    };
  }
};
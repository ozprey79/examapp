import {
  fail,
  redirect
} from '@sveltejs/kit';

import {
  getSavedQuestions
} from '$lib/server/savedQuestions.js';

import {
  db
} from '$lib/server/db.js';


export async function load({
  locals
}) {
  const user =
    locals.user;

  if (!user) {
    throw redirect(
      303,
      '/sign-in'
    );
  }

  const savedQuestions =
  await getSavedQuestions(user.id);

const savedPreview =
  savedQuestions.slice(0, 5);

const savedCount =
  savedQuestions.length;

    return {
  ...existingData,
  savedCount,
  savedPreview
};
}


export const actions = {

  answer: async ({
    request,
    locals
  }) => {

    const user =
      locals.user;

    if (!user) {
      return fail(
        401,
        {
          message:
            'Unauthorized.'
        }
      );
    }


    const userId =
      user.id;


    const formData =
      await request.formData();


    const questionId =
      formData.get(
        'questionId'
      );


    const selectedAnswerRaw =
      formData.get(
        'selectedAnswer'
      );


    if (
      typeof questionId !==
        'string' ||
      questionId.length === 0
    ) {
      return fail(
        400,
        {
          message:
            'Question ID is missing.'
        }
      );
    }


    const selectedAnswer =
      Number(
        selectedAnswerRaw
      );


    if (
      !Number.isInteger(
        selectedAnswer
      )
    ) {
      return fail(
        400,
        {
          message:
            'Selected answer is invalid.'
        }
      );
    }


    /*
      Fetch the answer only if this
      question is actually saved by
      this student.
    */

    const questionResult =
      await db.query(
        `
          SELECT
            q.correct_answer

          FROM
            public.questions q

          INNER JOIN
            public.student_saved_questions sq
          ON
            sq.question_id = q.id

          WHERE
            q.id = $1
            AND sq.user_id = $2

          LIMIT 1
        `,
        [
          questionId,
          userId
        ]
      );


    if (
      questionResult.rowCount === 0
    ) {
      return fail(
        404,
        {
          message:
            'Saved question not found.'
        }
      );
    }


    const correctAnswer =
      questionResult.rows[0]
        .correct_answer;


    const correct =
      selectedAnswer ===
      correctAnswer;


    return {
      success: true,
      correct,
      correctAnswer
    };
  }

};
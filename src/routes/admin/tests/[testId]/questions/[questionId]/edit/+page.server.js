import {
  error,
  fail,
  redirect
} from '@sveltejs/kit';

import {
  getQuestionForAdmin,
  updateQuestion
} from '$lib/server/questions.js';


export async function load({
  locals,
  params
}) {
  if (!locals.user) {
    redirect(
      303,
      '/sign-in'
    );
  }


  if (
    locals.profile?.role !==
    'admin'
  ) {
    redirect(
      303,
      '/student'
    );
  }


  const question =
    await getQuestionForAdmin(
      params.testId,
      params.questionId
    );


  if (!question) {
    error(
      404,
      'Question not found.'
    );
  }


  return {
    question
  };
}


export const actions = {
  default: async ({
    request,
    locals,
    params
  }) => {
    if (!locals.user) {
      redirect(
        303,
        '/sign-in'
      );
    }


    if (
      locals.profile?.role !==
      'admin'
    ) {
      return fail(
        403,
        {
          error:
            'Admin access required.'
        }
      );
    }


    const formData =
      await request.formData();


    const module =
      String(
        formData.get(
          'module'
        ) ?? ''
      );


    const topic =
      String(
        formData.get(
          'topic'
        ) ?? ''
      );


    const difficulty =
      Number(
        formData.get(
          'difficulty'
        )
      );


    const questionText =
      String(
        formData.get(
          'questionText'
        ) ?? ''
      );


    const optionsText =
      String(
        formData.get(
          'options'
        ) ?? ''
      );


    const correctAnswer =
      Number(
        formData.get(
          'correctAnswer'
        )
      );


    const explanation =
      String(
        formData.get(
          'explanation'
        ) ?? ''
      );


    const options =
      optionsText
        .split('\n')
        .map(
          (option) =>
            option.trim()
        )
        .filter(Boolean);


    try {
      const updated =
        await updateQuestion(
          params.testId,
          params.questionId,
          {
            module,
            topic,
            difficulty,
            questionText,
            options,
            correctAnswer,
            explanation
          }
        );


      if (!updated) {
        error(
          404,
          'Question not found.'
        );
      }


      redirect(
        303,
        `/admin/tests/${params.testId}`
      );
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'status' in err
      ) {
        throw err;
      }


      return fail(
        400,
        {
          error:
            err instanceof Error
              ? err.message
              : 'Could not update question.',

          values: {
            module,
            topic,
            difficulty,
            questionText,
            optionsText,
            correctAnswer,
            explanation
          }
        }
      );
    }
  }
};
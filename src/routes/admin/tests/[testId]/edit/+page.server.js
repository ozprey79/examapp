import {
  error,
  fail,
  redirect
} from '@sveltejs/kit';

import {
  getTestForAdmin,
  updateTest
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


  const test =
    await getTestForAdmin(
      params.testId
    );


  if (!test) {
    error(
      404,
      'Test not found.'
    );
  }


  return {
    test
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


    const title =
      String(
        formData.get(
          'title'
        ) ?? ''
      );


    const durationMinutes =
      Number(
        formData.get(
          'durationMinutes'
        )
      );


    const correctMarks =
      Number(
        formData.get(
          'correctMarks'
        )
      );


    const wrongMarks =
      Number(
        formData.get(
          'wrongMarks'
        )
      );


    const skippedMarks =
      Number(
        formData.get(
          'skippedMarks'
        )
      );


    try {
      const updated =
        await updateTest(
          params.testId,
          {
            title,
            durationMinutes,
            correctMarks,
            wrongMarks,
            skippedMarks
          }
        );


      if (!updated) {
        error(
          404,
          'Test not found.'
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
              : 'Could not update test.',

          values: {
            title,
            durationMinutes,
            correctMarks,
            wrongMarks,
            skippedMarks
          }
        }
      );
    }
  }
};
import {
  fail,
  redirect
} from '@sveltejs/kit';

import {
  importQuestionBank
} from '$lib/server/questions.js';


export function load({
  locals
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

  return {};
}


export const actions = {
  default: async ({
    request,
    locals
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

    const jsonText =
      formData.get(
        'questionBank'
      );


    if (
      typeof jsonText !==
      'string' ||
      jsonText.trim().length === 0
    ) {
      return fail(
        400,
        {
          error:
            'Question bank JSON is required.'
        }
      );
    }


    let questionBank;

    try {
      questionBank =
        JSON.parse(
          jsonText
        );
    } catch {
      return fail(
        400,
        {
          error:
            'The supplied text is not valid JSON.'
        }
      );
    }


    try {
const importResult =
  await importQuestionBank(
    questionBank
  );


if (!importResult.success) {
  return fail(
    400,
    {
      error:
        'Question bank validation failed.',

      validationErrors:
        importResult.validationErrors
    }
  );
}


return {
  success: true,
  result:
    importResult.result
};
    } catch (error) {
      return fail(
        400,
        {
          error:
            error instanceof Error
              ? error.message
              : 'Question import failed.'
        }
      );
    }
  }
};
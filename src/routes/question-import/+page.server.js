import {
  fail,
  redirect
} from '@sveltejs/kit';

import {
  importQuestionBank
} from '$lib/server/questions.js';

import {
  readQuestionBundle
} from '$lib/server/questionBundle.js';


export function load({
  locals
}) {
  requireAdmin(locals);
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

    let questionBank;
    let bundle;

    try {
      ({
        questionBank,
        bundle
      } = await readQuestionBundle(
        formData
      ));
    } catch (error) {
      return fail(
        400,
        {
          error:
            error instanceof Error
              ? error.message
              : 'Question bundle could not be read.'
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
          importResult.result,
        bundle
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


function requireAdmin(locals) {
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
}

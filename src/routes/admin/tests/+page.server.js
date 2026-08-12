import {
  fail,
  redirect
} from '@sveltejs/kit';

import {
  deleteTestSet,
  getTestsForAdmin
} from '$lib/server/questions.js';


export async function load({
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


  const tests =
    await getTestsForAdmin();


  return {
    tests
  };
}


export const actions = {
  delete: async ({
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
          deleteError:
            'Admin access required.'
        }
      );
    }

    const formData =
      await request.formData();

    const testId =
      formData.get('testId');

    if (
      typeof testId !== 'string' ||
      testId.trim().length === 0
    ) {
      return fail(
        400,
        {
          deleteError:
            'Question-set ID is missing.'
        }
      );
    }

    try {
      const result =
        await deleteTestSet(testId);

      if (result.status === 'not_found') {
        return fail(
          404,
          {
            deleteError:
              'That question set no longer exists.'
          }
        );
      }

      if (result.status === 'protected') {
        return fail(
          409,
          {
            deleteError:
              `"${result.title}" has ${result.attemptCount} recorded attempt${result.attemptCount === 1 ? '' : 's'} and cannot be deleted.`
          }
        );
      }

      return {
        deleted: true,
        deletedTitle:
          result.title,
        deletedQuestionCount:
          result.questionCount
      };
    } catch (error) {
      return fail(
        500,
        {
          deleteError:
            error instanceof Error
              ? error.message
              : 'Question set could not be deleted.'
        }
      );
    }
  }
};

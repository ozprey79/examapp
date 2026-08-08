import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getStudentAttemptForAdmin
} from '$lib/server/attempts.js';


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


  const attempt =
    await getStudentAttemptForAdmin(
      params.userId,
      params.attemptId
    );


  if (!attempt) {
    error(
      404,
      'Attempt not found.'
    );
  }


  return {
    attempt
  };
}
import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getAttemptByIdForUser
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
    'student'
  ) {
    redirect(
      303,
      '/admin'
    );
  }


  const attempt =
    await getAttemptByIdForUser(
      params.attemptId,
      locals.user.id
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
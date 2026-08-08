import {
  redirect
} from '@sveltejs/kit';

import {
  getAttemptHistoryForUser
} from '$lib/server/attempts.js';


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
    'student'
  ) {
    redirect(
      303,
      '/admin'
    );
  }

  const attempts =
    await getAttemptHistoryForUser(
      locals.user.id
    );

  return {
    attempts
  };
}
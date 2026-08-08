import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getStudentAttemptsForAdmin
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


  const result =
    await getStudentAttemptsForAdmin(
      params.userId
    );


  if (!result) {
    error(
      404,
      'Student not found.'
    );
  }


  return result;
}
import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getTestForAdmin
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
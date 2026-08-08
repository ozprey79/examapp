import {
  redirect
} from '@sveltejs/kit';

import {
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
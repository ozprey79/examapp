import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getTestForStudent
} from '$lib/server/questions.js';

import {
  shuffleArray
} from '$lib/utils/shuffle.js';


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


  const test =
    await getTestForStudent(
      params.testId
    );


  if (!test) {
    error(
      404,
      'Test not found.'
    );
  }


  if (
    test.questions.length === 0
  ) {
    error(
      404,
      'This test has no questions.'
    );
  }


  return {
    meta:
      test.meta,

    scoring:
      test.scoring,

    questions:
      shuffleArray(
        test.questions
      )
  };
}
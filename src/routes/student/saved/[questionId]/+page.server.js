import {
  error,
  redirect
} from '@sveltejs/kit';

import {
  getSavedQuestion
} from '$lib/server/savedQuestions';


export async function load({
  locals,
  params
}) {
  const user =
    locals.user;

  if (!user) {
    throw redirect(
      303,
      '/sign-in'
    );
  }

  const question =
    await getSavedQuestion(
      user.id,
      params.questionId
    );

  if (!question) {
    throw error(
      404,
      'Saved question not found'
    );
  }

  return {
    question
  };
}
import {
  redirect
} from '@sveltejs/kit';

import {
  getSavedQuestions
} from '$lib/server/savedQuestions.js';


export async function load({
  locals
}) {
  const user =
    locals.user;

  if (!user) {
    throw redirect(
      303,
      '/sign-in'
    );
  }


  const savedQuestions =
    await getSavedQuestions(
      user.id
    );


  return {
    savedQuestions
  };
}
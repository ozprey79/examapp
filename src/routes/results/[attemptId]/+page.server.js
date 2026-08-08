// src/routes/results/[attemptId]/+page.server.js

import {
  error
} from '@sveltejs/kit';

import {
  getAttemptById
} from '$lib/server/attempts.js';


export async function load({
  params
}) {
  const attempt =
    await getAttemptById(
      params.attemptId
    );

  if (attempt === null) {
    error(
      404,
      'Attempt not found.'
    );
  }

  return {
    attempt
  };
}
import {
  getLeitnerPracticeSummary
} from '$lib/server/leitner.js';

export async function load({ locals }) {
  const userId =
    locals.user.id;

  const summary =
    await getLeitnerPracticeSummary(
      userId
    );

  return {
    summary
  };
}
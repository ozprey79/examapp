import { getDueLeitnerQuestions } from '$lib/server/leitner.js';

export async function load({ locals }) {
  const userId = locals.user.id;

  const dueQuestions =
    await getDueLeitnerQuestions(
      userId
    );

  return {
    dueQuestions
  };
}
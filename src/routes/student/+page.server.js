// src/routes/student/+page.server.js

import {
  redirect
} from '@sveltejs/kit';

import {
  getStudentDashboardSummary
} from '$lib/server/attempts.js';

import {
  getAvailableTests
} from '$lib/server/questions.js';

import {
  getDueLeitnerQuestions
} from '$lib/server/leitner.js';


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

  const [
    progress,
    tests,
    dueQuestions
  ] = await Promise.all([
    getStudentDashboardSummary(
      locals.user.id
    ),

    getAvailableTests(),

    getDueLeitnerQuestions(
      locals.user.id
    )
  ]);

  return {
    user:
      locals.user,

    profile:
      locals.profile,

    progress,

    tests,

    revision: {
      dueCount:
        dueQuestions.length
    }
  };
}

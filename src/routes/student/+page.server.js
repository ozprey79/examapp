// src/routes/student/+page.server.js

import { redirect } from '@sveltejs/kit';

import {
  getStudentDashboardSummary
} from '$lib/server/attempts.js';

import {
  getAvailableTests
} from '$lib/server/questions.js';

import {
  getDueLeitnerQuestions,
  getLeitnerVisualization
} from '$lib/server/leitner.js';

import {
  getSavedQuestions
} from '$lib/server/savedQuestions.js';


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


  const userId =
    locals.user.id;


  const [
    progress,
    tests,
    dueQuestions,
    leitnerVisualization,
    savedQuestions
  ] =
    await Promise.all([
      getStudentDashboardSummary(
        userId
      ),

      getAvailableTests(),

      getDueLeitnerQuestions(
        userId
      ),

      getLeitnerVisualization(
        userId
      ),

      getSavedQuestions(
        userId
      )
    ]);


  return {
    user:
      locals.user,

    profile:
      locals.profile,

    progress,

    tests,

    leitnerVisualization,

    savedQuestions,

    savedCount:
      savedQuestions.length,

    revision: {
      dueCount:
        dueQuestions.length
    }
  };
}
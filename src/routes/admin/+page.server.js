import {
  redirect
} from '@sveltejs/kit';

import {
  getStudentProgressForAdmin
} from '$lib/server/attempts.js';


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

  const students =
    await getStudentProgressForAdmin();

  return {
    user:
      locals.user,

    profile:
      locals.profile,

    students
  };
}
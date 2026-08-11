// src/routes/admin/+page.server.js

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


  const totalAttempts =
    students.reduce(
      (
        total,
        student
      ) =>
        total +
        Number(
          student.attemptCount ??
          0
        ),
      0
    );


  const activeStudents =
    students.filter(
      (student) =>
        Number(
          student.attemptCount ??
          0
        ) > 0
    ).length;


  const latestActivity =
    students
      .map(
        (student) =>
          student.lastAttemptAt
      )
      .filter(Boolean)
      .map(
        (value) =>
          new Date(
            value
          )
      )
      .filter(
        (value) =>
          !Number.isNaN(
            value.getTime()
          )
      )
      .sort(
        (a, b) =>
          b.getTime() -
          a.getTime()
      )[0] ??
    null;


  return {
    user:
      locals.user,

    profile:
      locals.profile,

    students,

    stats: {
      studentCount:
        students.length,

      activeStudents,

      studentsWithoutAttempts:
        students.length -
        activeStudents,

      totalAttempts,

      latestActivity:
        latestActivity
          ? latestActivity.toISOString()
          : null
    }
  };
}
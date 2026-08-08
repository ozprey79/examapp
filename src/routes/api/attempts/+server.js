// src/routes/api/attempts/+server.js

import { json } from '@sveltejs/kit';

import {
  saveCompletedAttempt
} from '$lib/server/attempts.js';


export async function POST({
  request,
  locals
}) {
  // ----------------------------------------------------------
  // 1. Authentication
  // ----------------------------------------------------------

  if (!locals.user) {
    return json(
      {
        success: false,
        error:
          'You must be signed in to save an attempt.'
      },
      {
        status: 401
      }
    );
  }


  // ----------------------------------------------------------
  // 2. Student-only access
  // ----------------------------------------------------------

  if (
    locals.profile?.role !==
    'student'
  ) {
    return json(
      {
        success: false,
        error:
          'Only student accounts can save test attempts.'
      },
      {
        status: 403
      }
    );
  }


  // ----------------------------------------------------------
  // 3. Parse request JSON
  // ----------------------------------------------------------

  let attempt;

  try {
    attempt =
      await request.json();
  } catch {
    return json(
      {
        success: false,
        error:
          'Request body must contain valid JSON.'
      },
      {
        status: 400
      }
    );
  }


  // ----------------------------------------------------------
  // 4. Save attempt
  // ----------------------------------------------------------

  try {
    const result =
      await saveCompletedAttempt(
        attempt,
        locals.user.id
      );

    return json(
      {
        success: true,
        result
      },
      {
        status: 201
      }
    );
  } catch (error) {
    console.error(
      'Attempt save failed:',
      error
    );


    // Duplicate attempt
    if (
      isDuplicateAttemptError(
        error
      )
    ) {
      return json(
        {
          success: false,
          error:
            'This attempt has already been saved.'
        },
        {
          status: 409
        }
      );
    }


    // Validation error / database error
    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not save the attempt.'
      },
      {
        status: 400
      }
    );
  }
}


function isDuplicateAttemptError(
  error
) {
  return (
    error &&
    typeof error === 'object' &&
    error.code === '23505'
  );
}
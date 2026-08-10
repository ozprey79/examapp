import {
  json
} from '@sveltejs/kit';

import {
  isQuestionSaved,
  saveQuestion,
  removeSavedQuestion
} from '$lib/server/savedQuestions';


export async function GET({
  params,
  locals
}) {
  const user =
    locals.user;

  if (!user) {
    return json(
      {
        error:
          'Unauthorized'
      },
      {
        status: 401
      }
    );
  }

  const saved =
    await isQuestionSaved(
      user.id,
      params.questionId
    );

  return json({
    saved
  });
}


export async function PUT({
  params,
  locals
}) {
  const user =
    locals.user;

  if (!user) {
    return json(
      {
        error:
          'Unauthorized'
      },
      {
        status: 401
      }
    );
  }

  const result =
    await saveQuestion(
      user.id,
      params.questionId
    );

  return json(
    result
  );
}


export async function DELETE({
  params,
  locals
}) {
  const user =
    locals.user;

  if (!user) {
    return json(
      {
        error:
          'Unauthorized'
      },
      {
        status: 401
      }
    );
    
  }

  const result =
    await removeSavedQuestion(
      user.id,
      params.questionId
    );

  return json(
    result
  );
}
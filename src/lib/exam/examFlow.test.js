import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPrimaryActionLabel,
  getSubmissionSummary,
  lockAllAnswers
} from './examFlow.js';


test(
  'primary action labels describe the action that will occur',
  () => {
    assert.equal(
      getPrimaryActionLabel({
        hasAnswer: false,
        submitted: false,
        isLastQuestion: false
      }),
      'Skip & next'
    );

    assert.equal(
      getPrimaryActionLabel({
        hasAnswer: true,
        submitted: false,
        isLastQuestion: false
      }),
      'Submit & next'
    );

    assert.equal(
      getPrimaryActionLabel({
        hasAnswer: true,
        submitted: true,
        isLastQuestion: false
      }),
      'Next question'
    );

    assert.equal(
      getPrimaryActionLabel({
        hasAnswer: false,
        submitted: false,
        isLastQuestion: true
      }),
      'Finish test'
    );
  }
);


test(
  'submission summary counts selected and unanswered questions',
  () => {
    const questions = [
      { id: 'q1' },
      { id: 'q2' },
      { id: 'q3' }
    ];

    assert.deepEqual(
      getSubmissionSummary(
        questions,
        {
          q1: 0,
          q2: null,
          q3: undefined
        }
      ),
      {
        total: 3,
        answered: 1,
        unanswered: 2
      }
    );
  }
);


test(
  'final submission locks every answer without mutating prior state',
  () => {
    const submittedById = {
      q1: true,
      q2: false
    };

    assert.deepEqual(
      lockAllAnswers(
        [
          { id: 'q1' },
          { id: 'q2' }
        ],
        submittedById
      ),
      {
        q1: true,
        q2: true
      }
    );

    assert.equal(
      submittedById.q2,
      false
    );
  }
);

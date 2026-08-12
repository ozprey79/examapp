import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateStudyStreak,
  getLocalDateKey
} from './studyStreak.js';


test(
  'uses the student timezone when grouping completions',
  () => {
    assert.equal(
      getLocalDateKey(
        '2026-08-11T20:00:00.000Z'
      ),
      '2026-08-12'
    );
  }
);


test(
  'counts one active day even when several tests are completed',
  () => {
    const streak =
      calculateStudyStreak(
        [
          '2026-08-12T04:30:00.000Z',
          '2026-08-12T12:30:00.000Z'
        ],
        {
          now:
            new Date(
              '2026-08-12T15:30:00.000Z'
            )
        }
      );

    assert.equal(
      streak.current,
      1
    );

    assert.equal(
      streak.totalActiveDays,
      1
    );

    assert.equal(
      streak.completedToday,
      true
    );

    assert.equal(
      streak.recentDays.at(-1)
        .attemptCount,
      2
    );
  }
);


test(
  'keeps a consecutive streak at risk until today ends',
  () => {
    const streak =
      calculateStudyStreak(
        [
          '2026-08-09T06:00:00.000Z',
          '2026-08-10T06:00:00.000Z',
          '2026-08-11T06:00:00.000Z'
        ],
        {
          now:
            new Date(
              '2026-08-12T06:00:00.000Z'
            )
        }
      );

    assert.equal(
      streak.current,
      3
    );

    assert.equal(
      streak.atRisk,
      true
    );

    assert.equal(
      streak.completedToday,
      false
    );
  }
);


test(
  'resets the current streak after a missed day and retains the record',
  () => {
    const streak =
      calculateStudyStreak(
        [
          '2026-08-07T06:00:00.000Z',
          '2026-08-08T06:00:00.000Z',
          '2026-08-09T06:00:00.000Z'
        ],
        {
          now:
            new Date(
              '2026-08-12T06:00:00.000Z'
            )
        }
      );

    assert.equal(
      streak.current,
      0
    );

    assert.equal(
      streak.longest,
      3
    );
  }
);

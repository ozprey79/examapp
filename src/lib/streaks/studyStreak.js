const DAY_MILLISECONDS =
  24 * 60 * 60 * 1000;


export function getLocalDateKey(
  value,
  timeZone = 'Asia/Kolkata'
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const parts =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).formatToParts(date);

  const dateParts =
    Object.fromEntries(
      parts.map(
        ({ type, value: partValue }) =>
          [type, partValue]
      )
    );

  return [
    dateParts.year,
    dateParts.month,
    dateParts.day
  ].join('-');
}


export function dateKeyToDayNumber(
  dateKey
) {
  const [year, month, day] =
    dateKey
      .split('-')
      .map(Number);

  return Math.floor(
    Date.UTC(
      year,
      month - 1,
      day
    ) /
      DAY_MILLISECONDS
  );
}


export function calculateStudyStreak(
  completedAtValues,
  {
    now = new Date(),
    timeZone = 'Asia/Kolkata'
  } = {}
) {
  const attemptCountsByDate =
    new Map();

  for (
    const value of
      completedAtValues
  ) {
    const dateKey =
      getLocalDateKey(
        value,
        timeZone
      );

    if (!dateKey) {
      continue;
    }

    attemptCountsByDate.set(
      dateKey,
      (attemptCountsByDate.get(
        dateKey
      ) ?? 0) + 1
    );
  }

  const activeDateKeys =
    [
      ...attemptCountsByDate.keys()
    ].sort();

  const todayKey =
    getLocalDateKey(
      now,
      timeZone
    );

  const todayDay =
    dateKeyToDayNumber(
      todayKey
    );

  const activeDayNumbers =
    new Set(
      activeDateKeys.map(
        dateKeyToDayNumber
      )
    );

  const completedToday =
    activeDayNumbers.has(
      todayDay
    );

  const completedYesterday =
    activeDayNumbers.has(
      todayDay - 1
    );

  let current = 0;

  if (
    completedToday ||
    completedYesterday
  ) {
    let cursor =
      completedToday
        ? todayDay
        : todayDay - 1;

    while (
      activeDayNumbers.has(cursor)
    ) {
      current += 1;
      cursor -= 1;
    }
  }

  let longest = 0;
  let running = 0;
  let previousDay = null;

  for (
    const dayNumber of
      [...activeDayNumbers].sort(
        (first, second) =>
          first - second
      )
  ) {
    running =
      previousDay !== null &&
      dayNumber === previousDay + 1
        ? running + 1
        : 1;

    longest =
      Math.max(
        longest,
        running
      );

    previousDay = dayNumber;
  }

  const recentDays = [];

  for (
    let offset = 6;
    offset >= 0;
    offset -= 1
  ) {
    const dayNumber =
      todayDay - offset;

    const date =
      new Date(
        dayNumber *
          DAY_MILLISECONDS
      );

    recentDays.push({
      dateKey:
        date.toISOString()
          .slice(0, 10),
      label:
        new Intl.DateTimeFormat(
          'en-IN',
          {
            weekday: 'narrow',
            timeZone: 'UTC'
          }
        ).format(date),
      active:
        activeDayNumbers.has(
          dayNumber
        ),
      attemptCount:
        attemptCountsByDate.get(
          date.toISOString()
            .slice(0, 10)
        ) ?? 0,
      isToday:
        offset === 0
    });
  }

  return {
    current,
    longest,
    completedToday,
    atRisk:
      !completedToday &&
      completedYesterday,
    totalActiveDays:
      activeDateKeys.length,
    recentDays
  };
}

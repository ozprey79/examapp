export class QuestionTimer {
  #questionIds;

  currentQuestionId = $state(null);
  visitStartedAt = $state(null);

  timeById = $state({});

  liveElapsedMilliseconds = $state(0);

  constructor(
    questions,
    firstQuestionId
  ) {
    this.#questionIds =
      questions.map(
        (question) => question.id
      );

    this.reset(firstQuestionId);

    $effect(() => {
      const questionId =
        this.currentQuestionId;

      const startedAt =
        this.visitStartedAt;

      if (
        questionId === null ||
        startedAt === null
      ) {
        this.liveElapsedMilliseconds = 0;
        return;
      }

      const updateTimer = () => {
        this.liveElapsedMilliseconds =
          Math.max(
            0,
            Date.now() - startedAt
          );
      };

      updateTimer();

      const intervalId =
        setInterval(
          updateTimer,
          250
        );

      return () => {
        clearInterval(intervalId);
      };
    });
  }


  // ============================================================
  // Start / stop
  // ============================================================

  start(questionId) {
    this.currentQuestionId =
      questionId;

    this.visitStartedAt =
      Date.now();

    this.liveElapsedMilliseconds =
      0;
  }


  stopCurrent() {
    if (
      this.currentQuestionId === null ||
      this.visitStartedAt === null
    ) {
      return;
    }

    const elapsedMilliseconds =
      Math.max(
        0,
        Date.now() -
          this.visitStartedAt
      );

    this.timeById[
      this.currentQuestionId
    ] += elapsedMilliseconds;

    this.currentQuestionId =
      null;

    this.visitStartedAt =
      null;

    this.liveElapsedMilliseconds =
      0;
  }


  switchTo(
    questionId,
    shouldRecordTime = true
  ) {
    this.stopCurrent();

    if (shouldRecordTime) {
      this.start(questionId);
    }
  }


  // ============================================================
  // Reset
  // ============================================================

  reset(firstQuestionId) {
    const freshTimeState = {};

    this.#questionIds.forEach(
      (questionId) => {
        freshTimeState[
          questionId
        ] = 0;
      }
    );

    this.timeById =
      freshTimeState;

    this.currentQuestionId =
      null;

    this.visitStartedAt =
      null;

    this.liveElapsedMilliseconds =
      0;

    if (firstQuestionId) {
      this.start(
        firstQuestionId
      );
    }
  }


  // ============================================================
  // Reading time
  // ============================================================

  millisecondsFor(questionId) {
    const storedTime =
      this.timeById[
        questionId
      ] ?? 0;

    if (
      questionId ===
        this.currentQuestionId &&
      this.visitStartedAt !== null
    ) {
      return (
        storedTime +
        this.liveElapsedMilliseconds
      );
    }

    return storedTime;
  }


  formattedFor(questionId) {
    const totalSeconds =
      Math.floor(
        this.millisecondsFor(
          questionId
        ) / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return (
      String(minutes)
        .padStart(2, '0') +
      ':' +
      String(seconds)
        .padStart(2, '0')
    );
  }


  // ============================================================
  // Persistence
  // ============================================================

  snapshot() {
    const savedTimes = {
      ...this.timeById
    };

    if (
      this.currentQuestionId !== null &&
      this.visitStartedAt !== null
    ) {
      const activeVisitTime =
        Math.max(
          0,
          Date.now() -
            this.visitStartedAt
        );

      savedTimes[
        this.currentQuestionId
      ] += activeVisitTime;
    }

    return {
      timeById: savedTimes
    };
  }


  restore(
    savedTimer,
    currentQuestionId,
    shouldStart
  ) {
    const restoredTimes = {};

    this.#questionIds.forEach(
      (questionId) => {
        const savedTime =
          Number(
            savedTimer
              ?.timeById
              ?.[questionId]
          );

        restoredTimes[
          questionId
        ] =
          Number.isFinite(
            savedTime
          )
            ? Math.max(
                0,
                savedTime
              )
            : 0;
      }
    );

    this.timeById =
      restoredTimes;

    this.currentQuestionId =
      null;

    this.visitStartedAt =
      null;

    this.liveElapsedMilliseconds =
      0;

    if (
      shouldStart &&
      currentQuestionId
    ) {
      this.start(
        currentQuestionId
      );
    }
  }
}
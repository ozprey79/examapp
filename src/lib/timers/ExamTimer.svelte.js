export class ExamTimer {
  #durationMilliseconds;
  #onExpire;

  remainingSeconds = $state(0);
  deadlineMilliseconds = $state(0);
  running = $state(false);
  expired = $state(false);

  constructor(durationMinutes, onExpire) {
    this.#durationMilliseconds =
      durationMinutes * 60 * 1000;

    this.#onExpire = onExpire;

    this.restart();

   $effect(() => {
  if (!this.running) {
    return;
  }

  const activeDeadline =
    this.deadlineMilliseconds;

  const updateTimer = () => {
    const millisecondsLeft = Math.max(
      0,
      activeDeadline - Date.now()
    );

    this.remainingSeconds = Math.ceil(
      millisecondsLeft / 1000
    );

    if (
      millisecondsLeft === 0 &&
      !this.expired
    ) {
      this.expired = true;
      this.running = false;

      this.#onExpire?.();
    }
  };

  updateTimer();

  const intervalId = setInterval(
    updateTimer,
    250
  );

  return () => {
    clearInterval(intervalId);
  };
});
  }

  get formattedTime() {
    const minutes = Math.floor(
      this.remainingSeconds / 60
    );

    const seconds =
      this.remainingSeconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  stop() {
    this.running = false;
  }

  restart() {
    this.remainingSeconds = Math.ceil(
      this.#durationMilliseconds / 1000
    );

    this.deadlineMilliseconds =
      Date.now() +
      this.#durationMilliseconds;

    this.expired = false;
    this.running = true;
  }


   snapshot() {
  return {
    deadlineMilliseconds:
      this.deadlineMilliseconds
  };
}

restore(savedTimer) {
  const savedDeadline =
    Number(
      savedTimer?.deadlineMilliseconds
    );

  if (!Number.isFinite(savedDeadline)) {
    this.restart();
    return true;
  }

  const millisecondsLeft = Math.max(
    0,
    savedDeadline - Date.now()
  );

  this.deadlineMilliseconds =
    savedDeadline;

  this.remainingSeconds = Math.ceil(
    millisecondsLeft / 1000
  );

  this.expired =
    millisecondsLeft === 0;

  this.running =
    millisecondsLeft > 0;

  return millisecondsLeft > 0;
}


}
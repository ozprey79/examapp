export function loadAttempt(key) {
  try {
    const storedAttempt =
      localStorage.getItem(key);

    if (storedAttempt === null) {
      return null;
    }

    return JSON.parse(storedAttempt);
  } catch (error) {
    console.error(
      "Could not load saved attempt:",
      error
    );

    return null;
  }
}

export function saveAttempt(
  key,
  attempt
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(attempt)
    );
  } catch (error) {
    console.error(
      "Could not save attempt:",
      error
    );
  }
}

export function clearAttempt(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      "Could not clear attempt:",
      error
    );
  }
}
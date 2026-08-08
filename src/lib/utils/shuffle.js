/**
 * Returns a shuffled copy of an array.
 * The original array is not changed.
 */
export function shuffleArray(array) {
  const shuffled = [...array];

  for (
    let currentIndex = shuffled.length - 1;
    currentIndex > 0;
    currentIndex = currentIndex - 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (currentIndex + 1)
    );

    const temporaryItem =
      shuffled[currentIndex];

    shuffled[currentIndex] =
      shuffled[randomIndex];

    shuffled[randomIndex] =
      temporaryItem;
  }

  return shuffled;
}
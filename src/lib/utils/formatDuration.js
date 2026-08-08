export function formatMilliseconds(
  milliseconds
) {
  const totalSeconds = Math.round(
    milliseconds / 1000
  );

  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds =
    totalSeconds % 60;

  return (
    `${minutes} min ` +
    `${seconds} sec`
  );
}
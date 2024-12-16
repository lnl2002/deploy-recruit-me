export const getLastKeySegment = (key: string): string => {
  const segments = key.split(".");
  return segments[segments.length - 1];
};

export const camelToNormal = (text: string): string =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());

export function timeUntilFutureDate(futureDateString: string): string {
  const futureDate = new Date(futureDateString);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = futureDate.getTime() - currentDate.getTime();

  // Convert the difference to days, hours, minutes, and seconds
  const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

  if (days > 1) {
    return `${days} days left`;
  } else if (hours >= 1) {
    return `${hours} hours left`;
  } else {
    return `Less than 1 hour left`;
  }
}

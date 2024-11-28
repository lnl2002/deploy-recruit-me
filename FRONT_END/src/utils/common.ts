export const getLastKeySegment = (key: string): string => {
  const segments = key.split(".");
  return segments[segments.length - 1];
};

export const camelToNormal = (text: string): string =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());

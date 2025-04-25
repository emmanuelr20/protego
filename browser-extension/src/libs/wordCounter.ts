import _words from "lodash.words";
export const wordCounter = (text: string) => {
  const words = _words(text);

  // Count word frequency
  const frequency: Record<string, number> = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return {
    totalWords: words.length,
    uniqueWords: Object.keys(frequency).length,
  };
};

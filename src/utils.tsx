import { Row, Level as defaultLevels } from "./types";

export const updateScore = (
  rows: Row[],
  selectedLevel: defaultLevels | undefined,
  selectedSubLevel: string | undefined
): void => {
  let totalCount = 0;
  let correctCount = 0;
  rows.forEach((row) => {
    if (row.hasOwnProperty("isCorrect")) {
      totalCount++;
      if (row.isCorrect) {
        correctCount++;
      }
    }
  });
  const score = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(0) : "0";
  localStorage.setItem(`${selectedLevel}-${selectedSubLevel}`, score);
};

export const updateRowFeedback = (
  mode: "easy" | "hard",
  row: Row,
  translated: string,
  aiCorrect: boolean | undefined
): Row => {
  const gapMatch = translated.match(/\{(.+?)\}/);
  const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, "").toLowerCase();

  let isCorrect = true;
  let feedback;

  if (gapMatch) {
    // Gap fill mode: only check the gap, but still return full sentence feedback
    const expectedWord = gapMatch[1];
    const userWord = row.userInput.trim();
    const correct = mode === "hard" ? userWord === expectedWord : normalize(userWord) === normalize(expectedWord);

    isCorrect = correct;

    const before = translated.split(gapMatch[0])[0].split(" ").filter(Boolean);
    const after = translated.split(gapMatch[0])[1].split(" ").filter(Boolean);

    feedback = [
      ...before.map((w) => ({ word: w, correct: true })),
      { word: expectedWord, correct },
      ...after.map((w) => ({ word: w, correct: true })),
    ];
  } else {
    // Full sentence mode: word-by-word
    const germanWords = translated.split(" ");
    const userWords = row.userInput
      .trim()
      .split(" ")
      .filter((word) => word !== "");
    feedback = germanWords.map((gw, i) => {
      const uw = userWords[i] || "";
      const correct = mode === "hard" ? uw === gw : normalize(uw) === normalize(gw);
      if (!correct) {
        isCorrect = false;
      }
      return { word: gw, correct };
    });
  }

  return {
    ...row,
    translation: translated,
    feedback,
    isLoading: false,
    isCorrect,
    aiCorrect,
  };
};

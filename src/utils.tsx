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
  const germanWords = translated.split(" ");
  const userWords = row.userInput
    .trim()
    .split(" ")
    .filter((word) => word !== "");

  let isCorrect = true;
  const feedback = germanWords.map((gw, i) => {
    const uw = userWords[i] || "";
    const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, "").toLowerCase();
    const correct = mode === "hard" ? uw === gw : normalize(uw) === normalize(gw);
    if (!correct) {
      isCorrect = false;
    }
    return { word: gw, correct };
  });
  console.log("aiCorrect", aiCorrect);
  return { ...row, translation: translated, feedback, isLoading: false, isCorrect, aiCorrect };
};

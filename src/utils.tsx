import { Row, SelectedLevelType } from "./types";

export const updateScore = (
  rows: Row[],
  selectedLevel: SelectedLevelType,
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
  const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, "").toLowerCase();

  let isCorrect = true;
  let feedback;

  const germanWords = translated.replaceAll("{", "").replaceAll("}", "").split(" ");
  const userWords = row.userInput
    .trim()
    .split(" ")
    .filter((word) => word !== "");
  feedback = germanWords.map((gw, i) => {
    const uw = userWords[i]?.replaceAll("{", "")?.replaceAll("}", "") || "";
    const correct = mode === "hard" ? uw === gw : normalize(uw) === normalize(gw);
    if (!correct) {
      isCorrect = false;
    }
    return { word: gw, correct };
  });

  return {
    ...row,
    translation: translated,
    feedback,
    isLoading: false,
    isCorrect,
    aiCorrect,
  };
};

export const focusNextInput = (currentInput: HTMLInputElement | undefined, back: Boolean = false): void => {
  if (!currentInput) return;
  const inputs = Array.from(document.querySelectorAll("input")).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );

  const currentIndex = inputs.indexOf(currentInput);
  const newIndex = back ? currentIndex - 1 : currentIndex + 1;
  if (newIndex > -1 && currentIndex < inputs.length - 1) {
    inputs[newIndex].focus();
  }
};

export const splitSentences = (input: string): string[] => {
  if (!input) return [];
  return input
    ?.split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const splitAndShuffle = (input: string): string[] => {
  const sentences = splitSentences(input);
  return shuffleStrings(sentences);
};

const shuffleStrings = (input: string[]): string[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getLevelScore = (prefix: string): string => {
  let matchCount: number = 0;
  let matchTotal: number = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const value = localStorage.getItem(key);
      if (value) {
        const score: number = parseInt(value, 10);
        if (!isNaN(score)) {
          matchCount += score;
          matchTotal++;
        }
      }
    }
  }
  return matchTotal > 0 ? (matchCount / matchTotal).toFixed(0) : "0";
};

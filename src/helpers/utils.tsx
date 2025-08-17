import { getTranslationScores, setTranslationScore } from "./requests";
import { Row, SelectedLevelType, TranslationScore } from "./types";

export const updateScore = (
  rows: Row[],
  selectedLevel: SelectedLevelType,
  selectedSubLevel: string | undefined
): void => {
  let totalCount = 0;
  let correctCount = 0;
  let retryCount = 0;
  rows.forEach((row) => {
    if (row.hasOwnProperty("isCorrect") && !row.hasOwnProperty("isRetry")) {
      totalCount++;
      if (row.isCorrect) {
        correctCount++;
      }
    } else if (row.hasOwnProperty("isRetry")) {
      retryCount++;
    }
  });
  const score = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(0) : "0";
  const exerciseId = `${selectedLevel}-${selectedSubLevel}`;
  const localExerciseId = `translation-score-${exerciseId}`;
  const toSave = {
    exerciseId,
    score: Number(score),
    attempts: 1,
    updatedAt: "",
  };

  const localSave = localStorage.getItem(localExerciseId);
  if (localSave) {
    const localSaveJson = JSON.parse(localSave);
    toSave.updatedAt = localSaveJson.updatedAt;
    toSave.attempts = localSaveJson.attempts + 1;
  }
  localStorage.setItem(localExerciseId, JSON.stringify(toSave));

  const reachedEnd = totalCount + retryCount === rows.length;
  if (reachedEnd) {
    setTranslationScore(toSave, (res: any) => {
      console.log("Saved:", res?.exerciseId);
    });
  }
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
    inputs[newIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
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

export const getLevelScoreAverage = (prefix: string, subItems: number): string | null => {
  if (subItems <= 0) return null;
  let matchCount: number = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix + "-")) {
      const value = localStorage.getItem(key);
      if (value) {
        const score: number = parseInt(value, 10);
        if (!isNaN(score)) {
          matchCount += score;
        }
      }
    }
  }
  return matchCount > 0 ? (matchCount / subItems).toFixed(0) : null;
};

export const checkLogin = () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.log("Not Logged in");
    const url = new URL(window.location.href);
    const userId = url.searchParams.get("userId");
    if (userId) {
      localStorage.setItem("userId", userId);
      url.searchParams.delete("userId");
      window.history.replaceState({}, "", url);
    }
  }
};

export const initScores = () => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    getTranslationScores((scores: TranslationScore[]) => {
      if (scores?.length) {
        scores.forEach((score: TranslationScore) => {
          const localExerciseId = `translation-score-${score.exerciseId}`;
          localStorage.setItem(localExerciseId, JSON.stringify(score));
        });
        console.log("Scores initialized");
      }
    });
  }
};

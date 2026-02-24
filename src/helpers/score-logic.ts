import { IncorrectRow, Row } from "../types";

import { saveIncorrectList, saveUserIncorrectList } from "./storage";

export const updateScore = (
  rows: Row[],
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined,
  onSave?: (payload: any) => void,
): void => {
  let totalCount = 0;
  let correctCount = 0;
  let retryCount = 0;
  const incorrect: IncorrectRow[] = [];
  const exerciseId = `${selectedLevel}-${selectedSubLevel}`;

  rows.forEach((row) => {
    if (Object.prototype.hasOwnProperty.call(row, "isCorrect") && !row.isRetry) {
      totalCount++;
      if (row.isCorrect) {
        correctCount++;
      } else {
        incorrect.push({ exerciseId, ...row });
      }
    } else if (Object.prototype.hasOwnProperty.call(row, "isRetry") && row.feedback) {
      retryCount++;
    }
  });
  const score = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(0) : "0";

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
    localSaveJson.score = Number(score);
    localStorage.setItem(localExerciseId, JSON.stringify(localSaveJson));
  } else {
    localStorage.setItem(localExerciseId, JSON.stringify(toSave));
  }

  const reachedEnd = totalCount + retryCount === rows.length;
  if (reachedEnd) {
    if (localSave) {
      const localSaveJson = JSON.parse(localSave);
      toSave.attempts = localSaveJson.attempts + 1;
    }

    if (!exerciseId.includes("Incorrect Sentences")) {
      if (onSave) {
        onSave(toSave);
      }
    }
    if (localStorage.getItem("userId")) {
      saveUserIncorrectList(rows as IncorrectRow[], exerciseId);
    } else {
      saveIncorrectList(incorrect, exerciseId);
    }
  }
};

export const getScoreColorRange = (value: number, reverse = false, alpha = 1) => {
  const v = Math.max(0, Math.min(100, value)) / 100;
  // Swap if reversed
  const t = !reverse ? 1 - v : v;
  // Green: hsl(158, 60%, 48%)
  const start = { h: 158, s: 60, l: 48 };
  // Red: hsl(0, 80%, 62%)
  const end = { h: 0, s: 80, l: 62 };

  // Linear interpolation
  const h = start.h + (end.h - start.h) * t;
  const s = start.s + (end.s - start.s) * t;
  const l = start.l + (end.l - start.l) * t;

  return `hsl(${h}deg ${s}% ${l}% / ${alpha})`;
};

export const getLevelScoreAverage = (prefix: string, subItems: number): string | null => {
  if (subItems <= 0) return null;
  let matchCount: number = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("translation-score-" + prefix + "-")) {
      const value = localStorage.getItem(key);
      if (value) {
        const localSaveJson = JSON.parse(value);
        const score: number = parseInt(localSaveJson.score, 10);
        if (!isNaN(score)) {
          matchCount += score;
        }
      }
    }
  }
  return matchCount > 0 ? (matchCount / subItems).toFixed(0) : null;
};

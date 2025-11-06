import { To, NavigateOptions } from "react-router-dom";
import {
  getIncorrectSentences,
  getTranslationScores,
  refreshToken,
  sendIncorrectSentences,
  setTranslationScore,
} from "./requests";
import { IncorrectRow, Row, TranslationScore } from "./types";

const initIncorrectSentences = () => {
  getIncorrectSentences().then((res) => {
    if (res?.items) {
      const store = res.items.map((row: any) => {
        return {
          ...row,
          gapTranslation: row.translation,
          translation: row.translation.replaceAll("{", "").replaceAll("}", ""),
        };
      });
      const userId = localStorage.getItem("userId") ?? "unknown";
      const storageKey = userId + "-incorrectRows";
      localStorage.setItem(storageKey, JSON.stringify(store));
    }
  });
};

const saveUserIncorrectList = (rows: IncorrectRow[], exerciseId: string) => {
  const isIncorrectSentences = exerciseId.includes("Incorrect Sentences");

  let sentences = rows
    .filter((row) => row.userInput !== "")
    .map((row: IncorrectRow) => {
      return {
        exerciseId: row?.exerciseId ?? exerciseId,
        sentence: row.sentence,
        userInput: row.userInput,
        translation: row?.gapTranslation ?? row.translation,
        corrected: !!(row?.isCorrect || row?.aiCorrect),
      };
    });

  if (!isIncorrectSentences) {
    sentences = sentences.filter((row) => !row.corrected);
  }

  if (!sentences.length) return;

  sendIncorrectSentences(sentences).then((res) => {
    if (res) initIncorrectSentences();
  });
};

const saveIncorrectList = (incorrectRows: IncorrectRow[], exerciseId: string) => {
  const userId = localStorage.getItem("userId") ?? "unknown";
  const storageKey = userId + "-incorrectRows";
  const alreadySaved = localStorage.getItem(storageKey);

  if (alreadySaved && exerciseId !== "Incorrect Sentences-undefined") {
    const savedRows = JSON.parse(alreadySaved);
    const filtered = savedRows.filter((row: IncorrectRow) => row.exerciseId !== exerciseId);
    localStorage.setItem(storageKey, JSON.stringify([...filtered, ...incorrectRows]));
  } else {
    const sentences: string[] = [];
    incorrectRows = incorrectRows.filter((row) => {
      if (!sentences.includes(row.sentence)) {
        sentences.push(row.sentence);
        return true;
      }
      return false;
    });
    localStorage.setItem(storageKey, JSON.stringify(incorrectRows));
  }
};

export const updateScore = (
  rows: Row[],
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined
): void => {
  let totalCount = 0;
  let correctCount = 0;
  let retryCount = 0;
  const incorrect: IncorrectRow[] = [];
  const exerciseId = `${selectedLevel}-${selectedSubLevel}`;

  rows.forEach((row) => {
    if (row.hasOwnProperty("isCorrect") && !row.hasOwnProperty("isRetry")) {
      totalCount++;
      if (row.isCorrect) {
        correctCount++;
      } else {
        incorrect.push({ exerciseId, ...row });
      }
    } else if (row.hasOwnProperty("isRetry") && row.feedback) {
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
      setTranslationScore(toSave, (res: any) => {
        console.log("Saved:", res?.exerciseId);
      });
    }
    if (localStorage.getItem("userId")) {
      saveUserIncorrectList(rows as IncorrectRow[], exerciseId);
    } else {
      saveIncorrectList(incorrect, exerciseId);
    }
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
    aiCorrect: !isCorrect ? false : aiCorrect,
  };
};

export const focusNextInput = (currentInput: HTMLInputElement | undefined, back: Boolean = false): void => {
  const inputs = Array.from(document.querySelectorAll("input")).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );

  const currentIndex = !currentInput ? -1 : inputs.indexOf(currentInput);
  const newIndex = back ? currentIndex - 1 : currentIndex + 1;
  if (newIndex > -1 && (currentIndex < inputs.length - 1 || back)) {
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
  } else {
    refreshToken().then((res) => {
      console.log("Token checked");
    });
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

    initIncorrectSentences();
  }
};

export const clearLocalScores = () => {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("translation-score-")) {
      localStorage.removeItem(k);
    }
  });
};

export const hasIncorrectSentences = () => {
  const userId = localStorage.getItem("userId") ?? "unknown";
  const hasIncorrect = localStorage.getItem(userId + "-incorrectRows");
  return !!hasIncorrect;
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

export const encodeLevelName = (name: string): string => {
  const withUnderscores = name.replace(/\s+/g, "_");
  return encodeURIComponent(withUnderscores);
};

export const decodeLevelName = (name: string): string => {
  try {
    const decoded = decodeURIComponent(name);
    return decoded.replace(/_/g, " ");
  } catch (e) {
    return name.replace(/_/g, " ");
  }
};

export const parseUrlParams = (
  location_pathname: string
): { level: string | undefined; subLevel: string | undefined } => {
  const pathParts = location_pathname.split("/").filter(Boolean);
  if (pathParts.length === 0) return { level: undefined, subLevel: undefined };

  const level = decodeLevelName(pathParts[0]);
  const subLevel = pathParts.length >= 2 ? decodeLevelName(pathParts[1]) : undefined;
  return { level, subLevel };
};

export const updateUrl = (
  level: string | undefined,
  subLevel: string | undefined,
  navigate: (to: To, options?: NavigateOptions | undefined) => void
) => {
  let to = "/";
  if (level) to += encodeLevelName(level);
  if (subLevel) to += `/${encodeLevelName(subLevel)}`;

  navigate(to, { replace: true });
};

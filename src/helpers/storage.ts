import { IncorrectRow, TranslationScore } from "../types";
import { getIncorrectSentences, getTranslationScores, refreshToken, sendIncorrectSentences } from "./requests";

export const initIncorrectSentences = () => {
  getIncorrectSentences().then((res) => {
    if (res?.items) {
      const store = (res.items as any[]).map((row: any) => {
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

export const saveUserIncorrectList = (rows: IncorrectRow[], exerciseId: string) => {
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

export const saveIncorrectList = (incorrectRows: IncorrectRow[], exerciseId: string) => {
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

export interface FeedbackWord {
  word: string;
  correct: boolean;
}

export interface Row {
  sentence: string;
  userInput: string;
  translation: string;
  gapTranslation?: string;
  feedback: FeedbackWord[] | null;
  isLoading?: boolean;
  isCorrect?: boolean;
  aiCorrect?: boolean;
  isRetry?: boolean;
  batchId?: number;
  id: string;
}

export interface IncorrectRow extends Row {
  exerciseId: string;
}

export interface TranslationScore {
  exerciseId: string;
  score: Number;
}

export type KeyValue<T = unknown> = {
  [key: string]: T;
};

export type NextFn<T = unknown> = (data: T) => void;

export interface IncorrectSentences {
  exerciseId: string;
  sentence: string;
  userInput: string;
  translation: string;
  corrected?: boolean;
}

export interface Notification {
  message: string;
  type: "success" | "error" | "info" | "warning";
  open: boolean;
}

export interface ScorePayload {
  exerciseId: string;
  score: number;
  attempts: number;
  updatedAt: string;
}

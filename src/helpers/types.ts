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
}

export interface IncorrectRow extends Row {
  exerciseId: string;
}

export interface TranslationScore {
  exerciseId: string;
  score: Number;
}

export type KeyValue<T = any> = {
  [key: string]: T;
};

export type NextFn<T = any> = (data: T) => void;

export interface IncorrectSentences {
  exerciseId: string;
  sentence: string;
  userInput: string;
  translation: string;
  corrected?: boolean;
}

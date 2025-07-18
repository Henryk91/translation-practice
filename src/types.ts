export enum Level {
  A11 = "a1.1",
  A12 = "a1.2",
  A13 = "a1.3",
  A21 = "a2.1",
  A22 = "a2.2",
  A23 = "a2.3",
  B11 = "b1.1",
  B12 = "b1.2",
  B13 = "b1.3",
  B2 = "b2",
  C1 = "c1",
  C2 = "c2",
}

export interface FeedbackWord {
  word: string;
  correct: boolean;
}

export interface Row {
  sentence: string;
  userInput: string;
  translation: string;
  feedback: FeedbackWord[] | null;
  isLoading?: boolean;
  isCorrect?: boolean;
  aiCorrect?: boolean;
}

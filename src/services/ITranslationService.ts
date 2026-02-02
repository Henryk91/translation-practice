import { Row, KeyValue, TranslationScore, IncorrectSentences } from "../types";

export interface ITranslationService {
  getLevels(): Promise<KeyValue | undefined>;
  getSentenceWithTranslation(level: string, subLevel: string): Promise<Row[] | undefined>;
  translateSentence(sentence: string): Promise<string>;
  confirmTranslationCheck(english: string, german: string): Promise<boolean>;
  getTranslationScores(): Promise<TranslationScore[]>;
  setTranslationScore(payload: Record<string, unknown>): Promise<any>;
  sendIncorrectSentences(sentences: IncorrectSentences[]): Promise<KeyValue | undefined>;
  getIncorrectSentences(): Promise<KeyValue | undefined>;
  logoutUser(): Promise<KeyValue | undefined>;
}

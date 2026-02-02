import { ITranslationService } from "./ITranslationService";
import * as api from "../helpers/requests";
import { Row, KeyValue, TranslationScore, IncorrectSentences } from "../types";

export class TranslationService implements ITranslationService {
  async getLevels(): Promise<KeyValue | undefined> {
    return api.getLevels();
  }

  async getSentenceWithTranslation(level: string, subLevel: string): Promise<Row[] | undefined> {
    return api.getSentenceWithTranslation(level, subLevel);
  }

  async translateSentence(sentence: string): Promise<string> {
    return api.translateSentence(sentence);
  }

  async confirmTranslationCheck(english: string, german: string): Promise<boolean> {
    return api.confirmTranslationCheck(english, german);
  }

  async getTranslationScores(): Promise<TranslationScore[]> {
    return new Promise((resolve, reject) => {
      api.getTranslationScores((res: any) => {
        if (res?.error) reject(res.error);
        else resolve(res);
      });
    });
  }

  async setTranslationScore(payload: Record<string, unknown>): Promise<any> {
    return new Promise((resolve, reject) => {
      api.setTranslationScore(payload, (res: any) => {
        if (res?.error) reject(res.error);
        else resolve(res);
      });
    });
  }

  async sendIncorrectSentences(sentences: IncorrectSentences[]): Promise<KeyValue | undefined> {
    return api.sendIncorrectSentences(sentences);
  }

  async getIncorrectSentences(): Promise<KeyValue | undefined> {
    return api.getIncorrectSentences();
  }

  async logoutUser(): Promise<KeyValue | undefined> {
    return api.logoutUser();
  }
}

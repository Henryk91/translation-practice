import { updateScore, getScoreColorRange, getLevelScoreAverage } from "../score-logic";
import { Row } from "../../types";

describe("score-logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("updateScore", () => {
    it("should calculate score correctly for mixed results", () => {
      const rows: Row[] = [
        { id: "1", isCorrect: true },
        { id: "2", isCorrect: false }, // Incorrect
        { id: "3", isCorrect: true },
        { id: "4", isCorrect: true },
      ] as Row[];

      // 3 correct out of 4 = 75%
      updateScore(rows, "A1", "Unit1");

      const saved = localStorage.getItem("translation-score-A1-Unit1");
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.score).toBe(75);
    });

    it("should ignore retries in score calculation", () => {
      const rows: Row[] = [
        { id: "1", isCorrect: true },
        { id: "2", isRetry: true, feedback: "Keep trying" }, // Should be ignored for total count?
      ] as unknown as Row[];

      // Logic: if hasOwnProperty(isCorrect) && !isRetry -> count
      // if isRetry -> retryCount++
      // The function calculates score based on non-retry rows.

      updateScore(rows, "A1", "Unit1");

      const saved = localStorage.getItem("translation-score-A1-Unit1");
      const parsed = JSON.parse(saved!);
      // Only 1 valid row, which is correct -> 100%
      expect(parsed.score).toBe(100);
    });

    it("should save incorrect sentences", () => {
      const rows: Row[] = [{ id: "1", isCorrect: false, sentence: "Test", translation: "Test" }] as Row[];

      // Force reachedEnd condition
      // reachedEnd = totalCount + retryCount === rows.length
      // Here totalCount=1, rows.length=1. So it saves.

      updateScore(rows, "A1", "Unit1");

      const incorrect = localStorage.getItem("unknown-incorrectRows"); // "unknown" is default userId
      expect(incorrect).not.toBeNull();
      const parsed = JSON.parse(incorrect!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe("1");
    });
  });

  describe("getScoreColorRange", () => {
    it("should return a string", () => {
      const color = getScoreColorRange(80);
      expect(typeof color).toBe("string");
      expect(color).toContain("hsl");
    });
  });

  describe("getLevelScoreAverage", () => {
    it("should calculate average from localStorage", () => {
      localStorage.setItem("translation-score-A1-Unit1", JSON.stringify({ score: 100 }));
      localStorage.setItem("translation-score-A1-Unit2", JSON.stringify({ score: 50 }));

      // Total 150 / 2 = 75
      const avg = getLevelScoreAverage("A1", 2);
      expect(avg).toBe("75");
    });

    it("should return null if no subItems", () => {
      const avg = getLevelScoreAverage("A1", 0);
      expect(avg).toBeNull();
    });

    it("should handle missing scores (treat as 0 effectively? No, loop finds keys)", () => {
      // If only 1 exists out of 2 expected?
      // Logic: sums found scores, divides by subItems.
      // So 100 / 2 = 50.
      localStorage.setItem("translation-score-A1-Unit1", JSON.stringify({ score: 100 }));
      const avg = getLevelScoreAverage("A1", 2);
      expect(avg).toBe("50");
    });
  });
});

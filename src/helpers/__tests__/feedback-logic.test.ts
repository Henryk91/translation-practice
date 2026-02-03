import { updateRowFeedback } from "../feedback-logic";
import { Row } from "../../types";

describe("feedback-logic", () => {
  const mockRow: Row = {
    id: "test-1",
    sentence: "Hello World",
    userInput: "",
    translation: "Hallo Welt",
    feedback: null,
  };

  test("should mark correct input as correct (easy mode)", () => {
    const row = { ...mockRow, userInput: "hallo welt" };
    const result = updateRowFeedback("easy", row, "Hallo Welt", undefined);

    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toHaveLength(2);
    expect(result.feedback?.[0].correct).toBe(true);
  });

  test("should mark correct input with punctuation as correct (easy mode)", () => {
    const row = { ...mockRow, userInput: "hallo welt!" };
    // "Hallo Welt" vs "hallo welt!" -> normalize removes '!' -> match
    const result = updateRowFeedback("easy", row, "Hallo Welt", undefined);

    expect(result.isCorrect).toBe(true);
  });

  test("should fail incorrect word (easy mode)", () => {
    const row = { ...mockRow, userInput: "hallo werld" };
    const result = updateRowFeedback("easy", row, "Hallo Welt", undefined);

    expect(result.isCorrect).toBe(false);
    expect(result.feedback?.[1].correct).toBe(false); // Welt vs werld
  });

  test("should require exact case match in hard mode", () => {
    const row = { ...mockRow, userInput: "hallo welt" };
    const result = updateRowFeedback("hard", row, "Hallo Welt", undefined);

    expect(result.isCorrect).toBe(false); // Case mismatch
  });

  test("should pass exact case match in hard mode", () => {
    const row = { ...mockRow, userInput: "Hallo Welt" };
    const result = updateRowFeedback("hard", row, "Hallo Welt", undefined);

    expect(result.isCorrect).toBe(true);
  });

  test("should handle gap fill braces correctly", () => {
    // If translation has {Welt}, it should be stripped
    const row = { ...mockRow, userInput: "Hallo Welt" };
    const result = updateRowFeedback("easy", row, "Hallo {Welt}", undefined);

    expect(result.isCorrect).toBe(true);
    expect(result.translation).toBe("Hallo {Welt}");
    // check feedback word stripped
    expect(result.feedback?.[1].word).toBe("Welt");
  });
});

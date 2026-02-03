import {
  splitSentences,
  shuffleArray,
  encodeLevelName,
  decodeLevelName,
  parseUrlParams,
  updateUrl,
} from "../string-utils";

describe("string-utils", () => {
  describe("splitSentences", () => {
    it("should split text by punctuation", () => {
      const text = "Hello world. How are you? I am fine!";
      const result = splitSentences(text);
      expect(result).toEqual(["Hello world.", "How are you?", "I am fine!"]);
    });

    it("should handle empty input", () => {
      expect(splitSentences("")).toEqual([]);
    });
  });

  describe("shuffleArray", () => {
    it("should shuffle items", () => {
      const input = [1, 2, 3, 4, 5];
      // Mock Math.random to be deterministic if needed, or just check length and containment
      const result = shuffleArray(input);
      expect(result).toHaveLength(5);
      expect(result).toEqual(expect.arrayContaining(input));
      // Flaky check for order change usually avoided, but highly likely to change
    });
  });

  describe("Level Name Encoding", () => {
    it("should encode spaces as underscores and then URI encode", () => {
      const name = "Level One";
      const encoded = encodeLevelName(name);
      // "Level One" -> "Level_One" -> "Level_One"
      expect(encoded).toBe("Level_One");
    });

    it("should decode underscores back to spaces", () => {
      const name = "Level_One";
      const decoded = decodeLevelName(name);
      expect(decoded).toBe("Level One");
    });
  });

  describe("parseUrlParams", () => {
    it("should parse level and subLevel", () => {
      const path = "A1/Unit_1";
      const { level, subLevel } = parseUrlParams(path);
      expect(level).toBe("A1");
      expect(subLevel).toBe("Unit 1"); // checks decoding too
    });

    it("should handle only level", () => {
      const path = "A1";
      const { level, subLevel } = parseUrlParams(path);
      expect(level).toBe("A1");
      expect(subLevel).toBeUndefined();
    });
  });

  describe("updateUrl", () => {
    it("should call navigate with correct path", () => {
      const navigate = jest.fn();
      updateUrl("A1", "Unit 1", navigate);
      expect(navigate).toHaveBeenCalledWith("/A1/Unit_1", { replace: true });
    });
  });
});

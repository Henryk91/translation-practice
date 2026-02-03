import uiSlice, { uiActions } from "../ui-slice";

describe("ui slice", () => {
  const initialState = {
    notification: null,
    levelSelected: undefined,
    subLevelSelected: undefined,
    levels: [],
    levelSentences: {}, // simplified mock of initialLevelDict
  };

  it("should return the initial state", () => {
    // @ts-ignore - simplified state for test
    expect(uiSlice.reducer(undefined, { type: undefined })).toEqual(
      expect.objectContaining({
        levels: [],
      }),
    );
  });

  it("should handle showNotification", () => {
    const notification = { message: "Test", type: "success" as const, open: true };
    const nextState = uiSlice.reducer(initialState, uiActions.showNotification(notification));
    expect(nextState.notification).toEqual(notification);
  });

  it("should handle setLevel", () => {
    const nextState = uiSlice.reducer(initialState, uiActions.setLevel({ level: "A1" }));
    expect(nextState.levelSelected).toEqual("A1");
  });

  it("should handle setSubLevel", () => {
    const nextState = uiSlice.reducer(initialState, uiActions.setSubLevel({ subLevel: "Unit 1" }));
    expect(nextState.subLevelSelected).toEqual("Unit 1");
  });

  it("should handle setLevels", () => {
    const levels = ["A1", "A2"];
    const nextState = uiSlice.reducer(initialState, uiActions.setLevels(levels));
    expect(nextState.levels).toEqual(levels);
  });

  it("should handle setSubLevels", () => {
    const subLevels = ["Unit 1", "Unit 2"];
    const nextState = uiSlice.reducer(initialState, uiActions.setSubLevels(subLevels));
    expect(nextState.subLevels).toEqual(subLevels);
  });

  it("should handle setLevelSentences", () => {
    const sentences = { A1: "Hello" };
    const nextState = uiSlice.reducer(initialState, uiActions.setLevelSentences(sentences));
    expect(nextState.levelSentences).toEqual(sentences);
  });
});

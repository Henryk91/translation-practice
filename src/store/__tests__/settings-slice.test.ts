import settingsSlice, { settingsActions } from "../settings-slice";

describe("settings slice", () => {
  const initialSettingsState = {
    shouldSave: true,
    useGapFill: true,
    shuffleSentences: true,
    hasGapFill: true,
    showLevels: true,
    redoErrors: false,
    useMic: false,
    isComplete: false,
    chatUi: false,
    mode: "easy" as const,
    showNav: false,
  };

  const initialState = { settings: initialSettingsState };

  it("should return the initial state", () => {
    expect(settingsSlice.reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle setShouldSave", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setShouldSave(false));
    expect(nextState.settings.shouldSave).toBe(false);
  });

  it("should handle setUseGapFill", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setUseGapFill(false));
    expect(nextState.settings.useGapFill).toBe(false);
  });

  it("should handle setShuffleSentences", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setShuffleSentences(false));
    expect(nextState.settings.shuffleSentences).toBe(false);
  });

  it("should handle setHasGapFill", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setHasGapFill(false));
    expect(nextState.settings.hasGapFill).toBe(false);
  });

  it("should handle setShowLevels", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setShowLevels(false));
    expect(nextState.settings.showLevels).toBe(false);
  });

  it("should handle setRedoErrors", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setRedoErrors(true));
    expect(nextState.settings.redoErrors).toBe(true);
  });

  it("should handle setUseMic", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setUseMic(true));
    expect(nextState.settings.useMic).toBe(true);
  });

  it("should handle setIsComplete", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setIsComplete(true));
    expect(nextState.settings.isComplete).toBe(true);
  });

  it("should handle setMode", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setMode("hard"));
    expect(nextState.settings.mode).toBe("hard");
  });

  it("should handle setChatUi", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setChatUi(true));
    expect(nextState.settings.chatUi).toBe(true);
  });

  it("should handle setNav", () => {
    const nextState = settingsSlice.reducer(initialState, settingsActions.setNav(true));
    expect(nextState.settings.showNav).toBe(true);
  });
});

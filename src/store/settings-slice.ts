import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  shouldSave: boolean;
  useGapFill: boolean;
  shuffleSentences: boolean;
  hasGapFill: boolean;
  showLevels: boolean;
  redoErrors: boolean;
  useMic: boolean;
  isComplete: boolean;
  chatUi: boolean;
  mode: "easy" | "hard";
}

const settings: SettingsState = {
  shouldSave: true,
  useGapFill: true,
  shuffleSentences: true,
  hasGapFill: true,
  showLevels: true,
  redoErrors: false,
  useMic: false,
  isComplete: false,
  chatUi: false,
  mode: "easy",
};
const initialState: { settings: SettingsState } = {
  settings,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setShouldSave(state, actions) {
      state.settings.shouldSave = actions.payload;
    },
    setUseGapFill(state, actions) {
      state.settings.useGapFill = actions.payload;
    },
    setShuffleSentences(state, actions) {
      state.settings.shuffleSentences = actions.payload;
    },
    setHasGapFill(state, actions) {
      state.settings.hasGapFill = actions.payload;
    },
    setShowLevels(state, actions) {
      state.settings.showLevels = actions.payload;
    },
    setRedoErrors(state, actions) {
      state.settings.redoErrors = actions.payload;
    },
    setUseMic(state, actions) {
      state.settings.useMic = actions.payload;
    },
    setIsComplete(state, actions) {
      state.settings.isComplete = actions.payload;
    },
    setMode(state, actions) {
      state.settings.mode = actions.payload;
    },
    setChatUi(state, actions) {
      state.settings.chatUi = actions.payload;
    },
  },
});

export const settingsActions = settingsSlice.actions;

export default settingsSlice;

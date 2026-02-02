import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialLevelDict } from "../data/levelSentences";

export interface Notification {
  message: string;
  type: "success" | "error" | "info" | "warning";
  open: boolean;
}

interface UiState {
  notification: Notification | null;
  levelSelected?: string;
  subLevelSelected?: string;
  levels: string[];
  subLevels?: string[];
  levelSentences: Record<string, any>; // TODO: refine specific shape
}

const initialState: UiState = {
  notification: null,
  levelSelected: undefined,
  subLevelSelected: undefined,
  levels: [],
  levelSentences: initialLevelDict,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showNotification(state, action: PayloadAction<Notification>) {
      state.notification = action.payload;
    },
    setSubLevel(state, action: PayloadAction<{ subLevel: string | undefined }>) {
      state.subLevelSelected = action.payload.subLevel;
    },
    setLevel(state, action: PayloadAction<{ level: string | undefined }>) {
      state.levelSelected = action.payload.level;
    },
    setSubLevels(state, action: PayloadAction<string[] | undefined>) {
      state.subLevels = action.payload;
    },
    setLevels(state, action: PayloadAction<string[]>) {
      state.levels = action.payload;
    },
    setLevelSentences(state, action: PayloadAction<Record<string, any>>) {
      state.levelSentences = action.payload;
    },
  },
});

export const uiActions = uiSlice.actions;

export default uiSlice;

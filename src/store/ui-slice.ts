import { createSlice } from "@reduxjs/toolkit";
import { Dict } from "styled-components/dist/types";
import { initialLevelDict } from "../data/levelSentences";

interface Notification {
  message: any;
  type: any;
  open: any;
}

interface UiState {
  notification: Notification | null;
  levelSelected?: string;
  subLevelSelected?: string;
  levels: string[];
  subLevels?: string[];
  levelSentences: Dict;
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
    showNotification(state, action) {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type,
        open: action.payload.open,
      };
    },
    setSubLevel(state, actions) {
      state.subLevelSelected = actions.payload.subLevel;
    },
    setLevel(state, actions) {
      state.levelSelected = actions.payload.level;
    },
    setSubLevels(state, actions) {
      state.subLevels = actions.payload;
    },
    setLevels(state, actions) {
      state.levels = actions.payload;
    },
    setLevelSentences(state, actions) {
      state.levelSentences = actions.payload;
    },
  },
});

export const uiActions = uiSlice.actions;

export default uiSlice;

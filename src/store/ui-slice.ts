import { createSlice } from "@reduxjs/toolkit";

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
}

const initialState: UiState = {
  notification: null,
  levelSelected: undefined,
  subLevelSelected: undefined,
  levels: [],
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
  },
});

export const uiActions = uiSlice.actions;

export default uiSlice;

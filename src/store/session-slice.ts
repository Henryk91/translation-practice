import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Row } from "../types";

interface SessionState {
  allRows: Row[];
  currentBatchIndex: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  allRows: [],
  currentBatchIndex: 0,
  isLoading: false,
  error: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAllRows(state, action: PayloadAction<Row[]>) {
      state.allRows = action.payload;
    },
    setCurrentBatchIndex(state, action: PayloadAction<number>) {
      state.currentBatchIndex = action.payload;
    },
    updateRowInput(state, action: PayloadAction<{ id: string; userInput: string }>) {
      const { id, userInput } = action.payload;
      const row = state.allRows.find((r) => r.id === id);
      if (row) {
        row.userInput = userInput;
      }
    },
    updateRowFeedback(state, action: PayloadAction<{ id: string; row: Row }>) {
      const { id, row } = action.payload;
      const index = state.allRows.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.allRows[index] = row;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const sessionActions = sessionSlice.actions;
export default sessionSlice;

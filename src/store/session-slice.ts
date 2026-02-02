import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Row } from "../types"; // No longer needed in slice

interface SessionState {
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  isLoading: false,
  error: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
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

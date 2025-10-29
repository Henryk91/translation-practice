import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Row } from "../helpers/types";

type Message = { text: string; type: "bot" | "user" | "info" };

interface ChatState {
  mesages: Message[];
  seenSentence: string[];
  currentSentence?: Row;
}

const initialState: ChatState = {
  mesages: [],
  seenSentence: [],
  currentSentence: undefined,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addSeenSentence: (state, action: PayloadAction<string>) => {
      state.seenSentence.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.mesages.push(action.payload);
    },
    addMessages: (state, action: PayloadAction<Message[]>) => {
      state.mesages.push(...action.payload);
    },
    setCurrentSentence: (state, action: PayloadAction<Row>) => {
      state.currentSentence = action.payload;
    },
    clearMessages: (state) => {
      state.mesages = [];
    },
  },
});

export const chatActions = chatSlice.actions;

export default chatSlice;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Row } from "../types";

type Message = { text: string; type: "bot" | "user" | "info" };

interface ChatState {
  messages: Message[];
  seenSentence: string[];
  currentSentence?: Row;
}

const initialState: ChatState = {
  messages: [],
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
      state.messages.push(action.payload);
    },
    addMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages.push(...action.payload);
    },
    setCurrentSentence: (state, action: PayloadAction<Row>) => {
      state.currentSentence = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const chatActions = chatSlice.actions;

export default chatSlice;

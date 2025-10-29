import { configureStore } from "@reduxjs/toolkit";
import chatSlice from "./chat-slice";
import settingsSlice from "./settings-slice";
import uiSlice from "./ui-slice";

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    settings: settingsSlice.reducer,
    chat: chatSlice.reducer,
  },
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

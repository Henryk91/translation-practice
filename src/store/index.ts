import { configureStore } from "@reduxjs/toolkit";
import chatSlice from "./chat-slice";
import settingsSlice from "./settings-slice";
import uiSlice from "./ui-slice";
import sessionSlice from "./session-slice";

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    settings: settingsSlice.reducer,
    chat: chatSlice.reducer,
    session: sessionSlice.reducer,
  },
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

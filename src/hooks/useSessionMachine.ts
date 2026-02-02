import { useReducer } from "react";

export type SessionStatus = "idle" | "loading" | "practicing" | "completed" | "error";

export interface SessionState {
  status: SessionStatus;
  batchIndex: number;
  error?: string;
}

export type SessionAction =
  | { type: "START" }
  | { type: "LOAD_SUCCESS" }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "NEXT_BATCH"; totalBatches: number }
  | { type: "PREV_BATCH" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

const initialState: SessionState = {
  status: "idle",
  batchIndex: 0,
};

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case "START":
      return { ...state, status: "loading", error: undefined };
    case "LOAD_SUCCESS":
      return { ...state, status: "practicing", batchIndex: 0 };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.message };
    case "NEXT_BATCH": {
      // Check if we are at the last batch
      if (state.batchIndex >= action.totalBatches) {
        return { ...state, status: "completed" };
      }
      return { ...state, batchIndex: state.batchIndex + 1 };
    }
    case "PREV_BATCH":
      return { ...state, batchIndex: Math.max(0, state.batchIndex - 1) };
    case "COMPLETE":
      return { ...state, status: "completed" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

export const useSessionMachine = () => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  return { state, dispatch };
};

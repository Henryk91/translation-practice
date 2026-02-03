import { renderHook, act } from "@testing-library/react";
import { useSessionMachine } from "../useSessionMachine";

describe("useSessionMachine", () => {
  test("should initialize with idle status", () => {
    const { result } = renderHook(() => useSessionMachine());
    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.batchIndex).toBe(0);
  });

  test("should handle START action", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "START" });
    });
    expect(result.current.state.status).toBe("loading");
    expect(result.current.state.error).toBeUndefined();
  });

  test("should handle LOAD_SUCCESS action", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "START" });
      result.current.dispatch({ type: "LOAD_SUCCESS" });
    });
    expect(result.current.state.status).toBe("practicing");
    expect(result.current.state.batchIndex).toBe(0);
  });

  test("should handle NEXT_BATCH action", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "LOAD_SUCCESS" });
      result.current.dispatch({ type: "NEXT_BATCH", totalBatches: 2 });
    });
    expect(result.current.state.batchIndex).toBe(1);
    expect(result.current.state.status).toBe("practicing");
  });

  test("should transition to completed if NEXT_BATCH exceeds totalBatches", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "LOAD_SUCCESS" });
      // batchIndex 0
      result.current.dispatch({ type: "NEXT_BATCH", totalBatches: 0 });
      // Should complete
    });
    expect(result.current.state.status).toBe("completed");
  });

  test("should handle PREV_BATCH action", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "LOAD_SUCCESS" });
      result.current.dispatch({ type: "NEXT_BATCH", totalBatches: 5 }); // batch 1
      result.current.dispatch({ type: "PREV_BATCH" }); // batch 0
    });
    expect(result.current.state.batchIndex).toBe(0);
  });

  test("should handle RESET action", () => {
    const { result } = renderHook(() => useSessionMachine());
    act(() => {
      result.current.dispatch({ type: "START" });
      result.current.dispatch({ type: "RESET" });
    });
    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.batchIndex).toBe(0);
  });
});

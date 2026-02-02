import { useCallback, useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row } from "../types";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";
import { sessionActions } from "../store/session-slice";
import { shuffleArray } from "../helpers/utils";
import { incorrectSentenceCount, noSubLevel } from "../data/levelSentences";
import { useTranslationQuery } from "./useTranslationQuery";
import { useSessionMachine } from "./useSessionMachine";

export const useTranslationSession = (
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined,
  BATCH_SIZE: number = 10,
) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shuffleSentences, redoErrors } = settings;

  // Local State replacing Redux for Session Data
  const [allRows, setAllRowsLocal] = useState<Row[]>([]);

  // Finite State Machine
  const { state: machineState, dispatch: machineDispatch } = useSessionMachine();
  const { batchIndex } = machineState;

  // Data Fetching via TanStack Query
  const {
    data: queryRows,
    isLoading: isQueryLoading,
    error: queryError,
  } = useTranslationQuery(selectedLevel ?? "", selectedSubLevel ?? "");

  const rows = useMemo(() => {
    if (allRows.length > 0) {
      return allRows.filter((r) => r.batchId === batchIndex);
    }
    return [];
  }, [allRows, batchIndex]);

  const setAllRows = useCallback((newRows: Row[]) => {
    setAllRowsLocal(newRows);
  }, []);

  const updateRow = useCallback((id: string, changes: Partial<Row>) => {
    setAllRowsLocal((prev) => {
      const index = prev.findIndex((r) => r.id === id);
      if (index === -1) return prev;
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], ...changes };
      return newRows;
    });
  }, []);

  // Deprecated: prefer using machineDispatch directly in new code, but keeping signature for now.
  // We infer intent based on the index value.
  const setCurrentBatchIndex = useCallback(
    (index: number) => {
      /* Deprecated Redux Sync removed, handled purely by FSM now */
      // dispatch(sessionActions.setCurrentBatchIndex(index));

      if (index === 0) {
        // Often used as reset
        machineDispatch({ type: "RESET" });
        machineDispatch({ type: "LOAD_SUCCESS" }); // Go to practicing
      } else if (index > batchIndex) {
        const totalBatches = allRows.length > 0 ? Math.max(...allRows.map((r) => r.batchId || 0)) : 0;
        machineDispatch({ type: "NEXT_BATCH", totalBatches });
      } else {
        machineDispatch({ type: "PREV_BATCH" });
      }
    },
    [batchIndex, allRows, machineDispatch],
  );

  const updateRowInput = useCallback(
    (index: number, value: string) => {
      // index is relative to current batch 'rows'
      if (!rows[index] || rows[index].userInput === value) return;

      const rowId = rows[index].id;
      setAllRowsLocal((prev) => {
        const globalIndex = prev.findIndex((r) => r.id === rowId);
        if (globalIndex === -1) return prev;
        const newRows = [...prev];
        newRows[globalIndex] = { ...newRows[globalIndex], userInput: value };
        return newRows;
      });
    },
    [rows],
  );

  const shuffleRow = (rowsToShuffle: Row[]): Row[] => {
    return shuffleArray(rowsToShuffle);
  };

  const loadIncorrectSentences = useCallback(() => {
    const userId = localStorage.getItem("userId") ?? "unknown";
    const storageKey = userId + "-incorrectRows";
    const alreadySaved = localStorage.getItem(storageKey);
    if (alreadySaved) {
      const savedRows = JSON.parse(alreadySaved);
      const shuffle = shuffleSentences ? shuffleRow(savedRows) : savedRows;
      const items = shuffle.length > incorrectSentenceCount ? shuffle.slice(0, incorrectSentenceCount) : shuffle;
      const newRows = items.map((row: Row, idx: number) => {
        const { isCorrect, aiCorrect, isRetry, ...rest } = row;
        return {
          ...rest,
          id: `incorrect-${idx}`,
          batchId: Math.floor(idx / BATCH_SIZE),
          feedback: null,
          userInput: "",
          isLoading: undefined,
        };
      });
      setAllRowsLocal(newRows);
      machineDispatch({ type: "RESET" });
      machineDispatch({ type: "LOAD_SUCCESS" });
    } else {
      setAllRowsLocal([]);
      machineDispatch({ type: "RESET" });
      machineDispatch({ type: "LOAD_SUCCESS" });
    }
  }, [shuffleSentences, BATCH_SIZE, machineDispatch]);

  const redoSentences = (rowsToRedo: Row[]) => {
    const filteredRows = allRows.filter((row: Row) => !row.isRetry);
    const cleanRows = filteredRows.map((row: Row, idx: number) => {
      const { id, batchId, isCorrect, aiCorrect, ...rest } = row;
      return {
        ...rest,
        id: `redo-${idx}`,
        batchId: Math.floor(idx / BATCH_SIZE),
        feedback: null,
        userInput: "",
        isLoading: undefined,
        isCorrect: undefined,
        aiCorrect: undefined,
      };
    });
    const sentences = shuffleSentences ? shuffleRow(cleanRows) : cleanRows;
    setAllRowsLocal(sentences);
    machineDispatch({ type: "RESET" });
    machineDispatch({ type: "LOAD_SUCCESS" });
  };

  const setRetryRows = (newRows: Row[], wasFalse: boolean, index: number, row: Row, updatedRow: Row) => {
    if (redoErrors && !row.isRetry) {
      // Logic from old hook: identify global index
      const globalIndex = allRows.findIndex((r) => r.id === row.id);
      if (globalIndex === -1) return;

      const updatedAllRows = [...allRows];

      // Update the main row
      updatedAllRows[globalIndex] = updatedRow;

      if (wasFalse && (updatedRow.isCorrect || row.aiCorrect) && rows?.[index + 1]?.isRetry) {
        // Remove retry rows
        updatedAllRows.splice(globalIndex + 1, 3);
        setAllRowsLocal(updatedAllRows);
      } else if (!row.isRetry && updatedRow.isCorrect === false && !rows?.[index + 1]?.isRetry) {
        // Add retry rows
        const { aiCorrect, isCorrect, ...cleanRow } = updatedRow;
        const retryRowTemplate = { ...cleanRow, userInput: "", feedback: null, isRetry: true, batchId: row.batchId };

        const retryRows = [
          { ...retryRowTemplate, id: `${row.id}-retry-1` },
          { ...retryRowTemplate, id: `${row.id}-retry-2` },
          { ...retryRowTemplate, id: `${row.id}-retry-3` },
        ];

        updatedAllRows.splice(globalIndex + 1, 0, ...retryRows);
        setAllRowsLocal(updatedAllRows);
      } else {
        // Just the main row update
        setAllRowsLocal(updatedAllRows);
      }
    }
  };

  const clickSentenceAgain = (currentRows: Row[]) => {
    dispatch(settingsActions.setRedoErrors(false));
    dispatch(settingsActions.setIsComplete(false));
    machineDispatch({ type: "RESET" });
    machineDispatch({ type: "LOAD_SUCCESS" });

    if (noSubLevel.includes(selectedLevel as string)) {
      loadIncorrectSentences();
      return;
    }
    if (selectedSubLevel) {
      redoSentences(currentRows);
    }
  };

  // Sync Query Data to Local State and FSM status
  useEffect(() => {
    if (!selectedLevel || !selectedSubLevel) return;
    if (noSubLevel.includes(selectedLevel)) return;

    // Set loading state in Redux (Global UI Only - as allowed by plan)
    dispatch(sessionActions.setLoading(isQueryLoading));

    if (isQueryLoading) {
      machineDispatch({ type: "START" });
    }

    if (queryError) {
      dispatch(sessionActions.setError("Failed to load translations"));
      machineDispatch({ type: "LOAD_ERROR", message: "Failed to load" });
    }

    if (queryRows) {
      const hasGapFill = queryRows[0].translation.includes("{") && queryRows[0].translation.includes("}");
      const processedRows = queryRows.map((row, idx) => {
        // Clone row to avoid mutating query cache directly if we make changes before deep clone
        const newRow = { ...row };
        if (hasGapFill) {
          newRow.gapTranslation = newRow.translation;
          newRow.translation = newRow.translation.replaceAll("{", "").replaceAll("}", "");
        }
        return {
          ...newRow,
          userInput: "",
          feedback: null,
          batchId: Math.floor(idx / BATCH_SIZE),
          id: `${selectedLevel}-${selectedSubLevel}-${idx}`, // Ensure unique IDs
          isRetry: false,
        };
      });

      // If shuffle is enabled, shuffle them
      const finalRows = shuffleSentences ? shuffleRow(processedRows) : processedRows;

      setAllRowsLocal(finalRows);
      machineDispatch({ type: "LOAD_SUCCESS" });
    }
  }, [
    queryRows,
    isQueryLoading,
    queryError,
    selectedLevel,
    selectedSubLevel,
    dispatch, // Still needed for global UI loading state
    BATCH_SIZE,
    shuffleSentences,
    machineDispatch,
  ]);

  // Sync FSM batchIndex to Redux (Only if strictly needed for other components? AppRoutes?
  // AppRoutes gets batchIndex from useTranslationSession now.
  // TranslationPracticeContainer gets it from props.
  // So we probably don't need to sync batchIndex to Redux anymore!)
  // useEffect(() => {
  //   dispatch(sessionActions.setCurrentBatchIndex(batchIndex));
  // }, [batchIndex, dispatch]);

  return {
    allRows,
    setAllRows,
    rows,
    updateRow,
    currentBatchIndex: batchIndex,
    setCurrentBatchIndex,
    updateRowInput,
    loadIncorrectSentences,
    redoSentences,
    setRetryRows,
    clickSentenceAgain,
  };
};

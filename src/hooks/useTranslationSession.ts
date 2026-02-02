import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row } from "../types";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";
import { shuffleArray } from "../helpers/utils";
import { incorrectSentenceCount, noSubLevel } from "../data/levelSentences";

export const useTranslationSession = (
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined,
  BATCH_SIZE: number = 10,
) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shuffleSentences, redoErrors } = settings;

  const [allRows, setAllRows] = useState<Row[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);

  // Sync current batch with rows
  useEffect(() => {
    if (allRows.length > 0) {
      const currentBatch = allRows.filter((r) => r.batchId === currentBatchIndex);
      setRows(currentBatch);
    } else {
      setRows([]);
    }
  }, [allRows, currentBatchIndex]);

  const updateRowInput = useCallback(
    (index: number, value: string) => {
      // index is the index within 'rows' (current batch)
      if (rows[index].userInput === value) return; // No change

      const rowId = rows[index].id;
      // We update local rows for immediate feedback (though useEffect syncs it too, but we need it fast?)
      // Actually the useEffect [allRows] syncs 'rows', so if we update 'allRows', 'rows' updates.
      // But we also update 'rows' directly in App.tsx. Let's keep the pattern.

      setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
      setAllRows((current) => current.map((r) => (r.id === rowId ? { ...r, userInput: value } : r)));
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
      setAllRows(newRows);
      setCurrentBatchIndex(0);
    } else {
      setAllRows([]);
      setCurrentBatchIndex(0);
    }
  }, [shuffleSentences, BATCH_SIZE]);

  const redoSentences = (rowsToRedo: Row[]) => {
    // Logic from App.tsx
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
    setAllRows(sentences);
    setCurrentBatchIndex(0);
  };

  const setRetryRows = (newRows: Row[], wasFalse: boolean, index: number, row: Row, updatedRow: Row) => {
    if (redoErrors && !row.isRetry) {
      const globalIndex = allRows.findIndex((r) => r.id === row.id);
      if (globalIndex === -1) return;

      if (wasFalse && (updatedRow.isCorrect || row.aiCorrect) && rows?.[index + 1]?.isRetry) {
        // Remove retry rows from current batch
        newRows.splice(index + 1, 3);
        // Remove retry rows from allRows
        setAllRows((current) => {
          const updated = [...current];
          updated.splice(globalIndex + 1, 3);
          return updated;
        });
      } else if (!row.isRetry && updatedRow.isCorrect === false && !rows?.[index + 1]?.isRetry) {
        // Add retry rows to current batch
        const { aiCorrect, isCorrect, ...cleanRow } = updatedRow;
        const retryRowTemplate = { ...cleanRow, userInput: "", feedback: null, isRetry: true, batchId: row.batchId };

        const retryRows = [
          { ...retryRowTemplate, id: `${row.id}-retry-1` },
          { ...retryRowTemplate, id: `${row.id}-retry-2` },
          { ...retryRowTemplate, id: `${row.id}-retry-3` },
        ];

        newRows.splice(index + 1, 0, ...retryRows);
        // Add retry rows to allRows
        setAllRows((current) => {
          const updated = [...current];
          updated.splice(globalIndex + 1, 0, ...retryRows);
          return updated;
        });
      }
    }
  };

  const clickSentenceAgain = (currentRows: Row[]) => {
    dispatch(settingsActions.setRedoErrors(false));
    dispatch(settingsActions.setIsComplete(false));
    setCurrentBatchIndex(0);
    if (noSubLevel.includes(selectedLevel as string)) {
      loadIncorrectSentences();
      return;
    }
    if (selectedSubLevel) {
      redoSentences(currentRows);
    }
  };

  return {
    allRows,
    setAllRows,
    rows,
    setRows,
    currentBatchIndex,
    setCurrentBatchIndex,
    updateRowInput,
    loadIncorrectSentences,
    redoSentences,
    setRetryRows,
    clickSentenceAgain,
  };
};

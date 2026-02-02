import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row } from "../types";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";
import { sessionActions } from "../store/session-slice";
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

  const { allRows, currentBatchIndex } = useSelector((state: RootState) => state.session);

  const rows = useMemo(() => {
    if (allRows.length > 0) {
      return allRows.filter((r) => r.batchId === currentBatchIndex);
    }
    return [];
  }, [allRows, currentBatchIndex]);

  const setAllRows = useCallback(
    (newRows: Row[]) => {
      dispatch(sessionActions.setAllRows(newRows));
    },
    [dispatch],
  );

  const setRows = useCallback(
    (newRows: Row[] | ((current: Row[]) => Row[])) => {
      let updatedBatchAndMaybeMore: Row[];
      if (typeof newRows === "function") {
        updatedBatchAndMaybeMore = newRows(rows);
      } else {
        updatedBatchAndMaybeMore = newRows;
      }

      // Merge updated batch back into allRows
      const newAllRows = [...allRows];
      updatedBatchAndMaybeMore.forEach((updatedRow) => {
        const idx = newAllRows.findIndex((r) => r.id === updatedRow.id);
        if (idx !== -1) {
          newAllRows[idx] = updatedRow;
        }
      });
      dispatch(sessionActions.setAllRows(newAllRows));
    },
    [dispatch, allRows, rows],
  );

  const setCurrentBatchIndex = useCallback(
    (index: number) => {
      dispatch(sessionActions.setCurrentBatchIndex(index));
    },
    [dispatch],
  );

  const updateRowInput = useCallback(
    (index: number, value: string) => {
      // index is the index within 'rows' (current batch)
      if (!rows[index] || rows[index].userInput === value) return;

      const rowId = rows[index].id;
      dispatch(sessionActions.updateRowInput({ id: rowId, userInput: value }));
    },
    [dispatch, rows],
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
      dispatch(sessionActions.setAllRows(newRows));
      dispatch(sessionActions.setCurrentBatchIndex(0));
    } else {
      dispatch(sessionActions.setAllRows([]));
      dispatch(sessionActions.setCurrentBatchIndex(0));
    }
  }, [shuffleSentences, BATCH_SIZE, dispatch]);

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
    dispatch(sessionActions.setAllRows(sentences));
    dispatch(sessionActions.setCurrentBatchIndex(0));
  };

  const setRetryRows = (newRows: Row[], wasFalse: boolean, index: number, row: Row, updatedRow: Row) => {
    if (redoErrors && !row.isRetry) {
      const globalIndex = allRows.findIndex((r) => r.id === row.id);
      if (globalIndex === -1) return;

      const updatedAllRows = [...allRows];

      // Update the main row first (as usually done in handleTranslate)
      updatedAllRows[globalIndex] = updatedRow;

      if (wasFalse && (updatedRow.isCorrect || row.aiCorrect) && rows?.[index + 1]?.isRetry) {
        // Remove retry rows
        updatedAllRows.splice(globalIndex + 1, 3);
        dispatch(sessionActions.setAllRows(updatedAllRows));
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
        dispatch(sessionActions.setAllRows(updatedAllRows));
      }
    }
  };

  const clickSentenceAgain = (currentRows: Row[]) => {
    dispatch(settingsActions.setRedoErrors(false));
    dispatch(settingsActions.setIsComplete(false));
    dispatch(sessionActions.setCurrentBatchIndex(0));
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

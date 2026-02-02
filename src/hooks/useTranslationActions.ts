import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { settingsActions } from "../store/settings-slice";
import { confirmTranslationCheck, translateSentence } from "../helpers/requests";
import { focusNextInput, updateRowFeedback, updateScore } from "../helpers/utils";
import { Row } from "../types";

export const useTranslationActions = (
  session: any, // Typed correctly in usage or we import type for session
  settings: any,
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>,
  altButtonDown: boolean,
  setShowAiNotice: (show: boolean) => void,
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined,
) => {
  const dispatch = useDispatch();
  const { mode, shouldSave } = settings;
  const { rows, setRows, allRows, setAllRows, setRetryRows } = session;

  const handleAiCheck = async (index: number, lastInput: HTMLInputElement | undefined): Promise<void> => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowAiNotice(true);
      return;
    }

    setRows((current: Row[]) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    const isCorrect = row.isCorrect;
    if (!row.userInput || (isCorrect === undefined && !altButtonDown) || isCorrect === true) {
      setRows((current: Row[]) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    const promptWords = mode === "easy" ? row.sentence.toLowerCase() : row.sentence;
    let checkSentence = row.userInput.replaceAll("{", "").replaceAll("}", "");
    checkSentence = mode === "easy" ? checkSentence.toLowerCase() : checkSentence;
    const isTranslationCorrect = await confirmTranslationCheck(promptWords, checkSentence);
    const wasFalse = row.isCorrect === false || row.aiCorrect === false;

    const updatedRow = updateRowFeedback(
      mode,
      row,
      isTranslationCorrect ? row.userInput : row.translation,
      isTranslationCorrect,
    );
    const newRows = rows.map((r: Row, i: number) => (i === index ? updatedRow : r));

    // Update allRows with the main change first
    const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
    setAllRows(updatedAllRows);

    // Then handle retry rows
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    setRows(newRows);

    if (shouldSave) updateScore(updatedAllRows, selectedLevel, selectedSubLevel);
    if (isTranslationCorrect) {
      focusNextInput(lastInput, inputRefs.current, index);
    } else {
      lastInput?.focus();
    }
  };

  const handleTranslate = async (index: number, event: HTMLInputElement | undefined, value?: string): Promise<void> => {
    if (altButtonDown) {
      await handleAiCheck(index, event);
      return;
    }
    setRows((current: Row[]) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const userInput = value !== undefined ? value : rows[index].userInput;
    const row = rows[index];
    if (!userInput) {
      setRows((current: Row[]) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    if (event) focusNextInput(event, inputRefs.current, index);
    const translated = row.translation ? row.translation : await translateSentence(row.sentence);

    const wasFalse = row.isCorrect === false || row.aiCorrect === false;
    const rowWithInput = { ...row, userInput };
    const updatedRow = updateRowFeedback(mode, rowWithInput, translated, row.aiCorrect);

    const newRows = rows.map((r: Row, i: number) => (i === index ? updatedRow : r));

    // Update allRows with the main change first
    const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
    setAllRows(updatedAllRows);

    // Then handle retry rows
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    if (shouldSave) updateScore(updatedAllRows, selectedLevel, selectedSubLevel);
    setRows(newRows);

    const currentBatchComplete = newRows.every((row: Row) => row.feedback);
    dispatch(settingsActions.setIsComplete(currentBatchComplete));
  };

  const handleChatCorrect = useCallback(
    (row: Row, userInput: string) => {
      const updatedRow = updateRowFeedback(mode, { ...row, userInput }, row.translation, true);

      const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
      setAllRows(updatedAllRows);

      if (shouldSave) updateScore(updatedAllRows, selectedLevel, selectedSubLevel);

      const newRows = rows.map((r: Row) => (r.id === row.id ? updatedRow : r));
      setRows(newRows);

      const currentBatchComplete = newRows.every((r: Row) => r.feedback);
      dispatch(settingsActions.setIsComplete(currentBatchComplete));
    },
    [mode, allRows, setAllRows, shouldSave, selectedLevel, selectedSubLevel, rows, setRows, dispatch],
  );

  return { handleAiCheck, handleTranslate, handleChatCorrect };
};

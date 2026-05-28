import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { usePostHog } from "@posthog/react";
import { settingsActions } from "../store/settings-slice";
import { confirmTranslationCheck, translateSentence } from "../helpers/requests";
import { focusNextInput, updateRowFeedback, updateScore } from "../helpers/utils";
import { Row } from "../types";
import { useSubmitTranslationMutation } from "./useSubmitTranslationMutation";

export const useTranslationActions = (
  session: any,
  settings: any,
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>,
  altButtonDown: boolean,
  setShowAiNotice: (show: boolean) => void,
  selectedLevel: string | undefined,
  selectedSubLevel: string | undefined,
) => {
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const { mode, shouldSave } = settings;
  const { rows, updateRow, allRows, setRetryRows } = session;

  const submitMutation = useSubmitTranslationMutation();

  const handleAiCheck = async (index: number, lastInput: HTMLInputElement | undefined): Promise<void> => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowAiNotice(true);
      return;
    }

    const row = rows[index];
    updateRow(row.id, { isLoading: true });

    const isCorrect = row.isCorrect;
    if (!row.userInput || (isCorrect === undefined && !altButtonDown) || isCorrect === true) {
      updateRow(row.id, { isLoading: false });
      return;
    }

    const promptWords = mode === "easy" ? row.sentence.toLowerCase() : row.sentence;
    let checkSentence = row.userInput.replaceAll("{", "").replaceAll("}", "");
    checkSentence = mode === "easy" ? checkSentence.toLowerCase() : checkSentence;
    const isTranslationCorrect = await confirmTranslationCheck(promptWords, checkSentence);
    const wasFalse = row.isCorrect === false || row.aiCorrect === false;

    posthog?.capture("ai_check_requested", {
      level: selectedLevel,
      sub_level: selectedSubLevel,
      is_correct: isTranslationCorrect,
      mode,
    });

    const updatedRow = updateRowFeedback(
      mode,
      row,
      isTranslationCorrect ? row.userInput : row.translation,
      isTranslationCorrect,
    );

    // Update the row in global state
    updateRow(row.id, updatedRow);

    const newRows = rows.map((r: Row, i: number) => (i === index ? updatedRow : r));

    // Then handle retry rows
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    if (shouldSave) {
      const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
      updateScore(updatedAllRows, selectedLevel, selectedSubLevel, (payload: any) => submitMutation.mutate(payload));
    }

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
    const row = rows[index];
    updateRow(row.id, { isLoading: true });

    const userInput = value !== undefined ? value : rows[index].userInput;
    if (!userInput) {
      updateRow(row.id, { isLoading: false });
      return;
    }

    if (event) focusNextInput(event, inputRefs.current, index);
    const translated = row.translation ? row.translation : await translateSentence(row.sentence);

    const wasFalse = row.isCorrect === false || row.aiCorrect === false;
    const rowWithInput = { ...row, userInput };
    const updatedRow = updateRowFeedback(mode, rowWithInput, translated, row.aiCorrect);

    posthog?.capture("translation_submitted", {
      level: selectedLevel,
      sub_level: selectedSubLevel,
      is_correct: updatedRow.isCorrect,
      mode,
    });

    updateRow(row.id, updatedRow);

    const newRows = rows.map((r: Row, i: number) => (i === index ? updatedRow : r));

    // Then handle retry rows
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    if (shouldSave) {
      const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
      updateScore(updatedAllRows, selectedLevel, selectedSubLevel, (payload: any) => submitMutation.mutate(payload));
    }

    // Check completion
    const currentBatchComplete = newRows.every((row: Row) => row.feedback);
    if (currentBatchComplete) {
      posthog?.capture("exercise_completed", {
        level: selectedLevel,
        sub_level: selectedSubLevel,
        mode,
      });
    }
    dispatch(settingsActions.setIsComplete(currentBatchComplete));
  };

  const handleChatCorrect = useCallback(
    (row: Row, userInput: string) => {
      const updatedRow = updateRowFeedback(mode, { ...row, userInput }, row.translation, true);

      // Update row
      updateRow(row.id, updatedRow);

      if (shouldSave) {
        const updatedAllRows = allRows.map((r: Row) => (r.id === row.id ? updatedRow : r));
        updateScore(updatedAllRows, selectedLevel, selectedSubLevel, (payload: any) => submitMutation.mutate(payload));
      }

      // Check completion
      const newRows = rows.map((r: Row) => (r.id === row.id ? updatedRow : r));
      const currentBatchComplete = newRows.every((r: Row) => r.feedback);
      dispatch(settingsActions.setIsComplete(currentBatchComplete));
    },
    [mode, allRows, updateRow, shouldSave, selectedLevel, selectedSubLevel, rows, dispatch, submitMutation],
  );

  return { handleAiCheck, handleTranslate, handleChatCorrect };
};

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";
import MainLayout from "../layouts/MainLayout";
import TranslationPractice from "../features/session/container/TranslationPracticeContainer";
import NoticeModal from "../features/session/components/NoticeModal";
import { useTranslationSession } from "../hooks/useTranslationSession";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useRoutingSync } from "../hooks/useRoutingSync";
import { useTranslationActions } from "../hooks/useTranslationActions";

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch();

  // Redux State
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { useGapFill } = settings;

  // Local State
  const [text, setText] = useState<string>("");
  const [showAiNotice, setShowAiNotice] = useState<boolean>(false);
  const inputRefs = React.useRef<Map<number, HTMLInputElement>>(new Map());

  // Session Hook
  const BATCH_SIZE = 10;
  const session = useTranslationSession(selectedLevel, selectedSubLevel, BATCH_SIZE);
  const { allRows, setAllRows, setCurrentBatchIndex, currentBatchIndex, loadIncorrectSentences, clickSentenceAgain } =
    session;

  // Routing Hook
  const { handleLevelChange, handleSubLevelChange, nextExercise } = useRoutingSync(
    setText,
    setAllRows,
    setCurrentBatchIndex,
    loadIncorrectSentences,
    BATCH_SIZE,
  );

  // Translation Actions Hook
  const { altButtonDown, shiftButtonDown } = useKeyboardShortcuts();
  const { handleAiCheck, handleTranslate, handleChatCorrect } = useTranslationActions(
    session,
    settings,
    inputRefs,
    altButtonDown,
    setShowAiNotice,
    selectedLevel,
    selectedSubLevel,
  );

  const handleNextBatch = (previous?: boolean) => {
    if (previous) {
      nextExercise(true);
      return;
    }

    const anySentencesAttempted = allRows.some((r) => r.feedback);
    if (!anySentencesAttempted) {
      nextExercise();
      return;
    }

    const maxBatchId = allRows.length > 0 ? Math.max(...allRows.map((r) => r.batchId || 0)) : 0;
    const hasMoreBatches = currentBatchIndex < maxBatchId;

    if (hasMoreBatches) {
      setCurrentBatchIndex(currentBatchIndex + 1);
      dispatch(settingsActions.setIsComplete(false));
    } else {
      nextExercise();
    }
  };

  return (
    <MainLayout handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange}>
      <Routes>
        <Route
          path="/"
          element={
            <TranslationPractice
              handleLevelChange={handleLevelChange}
              handleSubLevelChange={handleSubLevelChange}
              selectedSubLevel={selectedSubLevel}
              setText={setText}
              text={text}
              handleChatCorrect={handleChatCorrect}
              handleNextBatch={handleNextBatch}
              inputRefs={inputRefs}
              handleTranslate={handleTranslate}
              handleAiCheck={handleAiCheck}
              useGapFill={useGapFill}
              shiftButtonDown={shiftButtonDown}
              clickSentenceAgain={clickSentenceAgain}
            />
          }
        />
        <Route
          path="/:level"
          element={
            <TranslationPractice
              handleLevelChange={handleLevelChange}
              handleSubLevelChange={handleSubLevelChange}
              selectedSubLevel={selectedSubLevel}
              setText={setText}
              text={text}
              handleChatCorrect={handleChatCorrect}
              handleNextBatch={handleNextBatch}
              inputRefs={inputRefs}
              handleTranslate={handleTranslate}
              handleAiCheck={handleAiCheck}
              useGapFill={useGapFill}
              shiftButtonDown={shiftButtonDown}
              clickSentenceAgain={clickSentenceAgain}
            />
          }
        />
        <Route
          path="/:level/:subLevel"
          element={
            <TranslationPractice
              handleLevelChange={handleLevelChange}
              handleSubLevelChange={handleSubLevelChange}
              selectedSubLevel={selectedSubLevel}
              setText={setText}
              text={text}
              handleChatCorrect={handleChatCorrect}
              handleNextBatch={handleNextBatch}
              inputRefs={inputRefs}
              handleTranslate={handleTranslate}
              handleAiCheck={handleAiCheck}
              useGapFill={useGapFill}
              shiftButtonDown={shiftButtonDown}
              clickSentenceAgain={clickSentenceAgain}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NoticeModal
        isOpen={showAiNotice}
        onClose={() => setShowAiNotice(false)}
        title="AI Feedback Restricted"
        message="AI feedback functionality is currently only available for authenticated users. Please log in to your account to enable AI support for your translation sessions."
      />
    </MainLayout>
  );
};

export default AppRoutes;

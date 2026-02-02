import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GlobalStyle } from "./helpers/style";
import { Row } from "./types";
import { getSentenceWithTranslation } from "./helpers/requests";
import { shuffleArray } from "./helpers/utils";
import SideBar from "./components/SideBar";
import TranslationPractice from "./components/TranslationPractice";
import NoticeModal from "./components/NoticeModal";
import { RootState } from "./store";
import { settingsActions } from "./store/settings-slice";
import { useTranslationSession } from "./hooks/useTranslationSession";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useRoutingSync } from "./hooks/useRoutingSync";
import { useTranslationActions } from "./hooks/useTranslationActions";

const App: React.FC = () => {
  const dispatch = useDispatch();

  // Custom Hooks
  useAppInitialization();
  const { shiftButtonDown, altButtonDown } = useKeyboardShortcuts();

  // Redux State
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shuffleSentences, useGapFill } = settings;

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
    session.setRows,
    setCurrentBatchIndex,
    loadIncorrectSentences,
    BATCH_SIZE,
  );

  // Translation Actions Hook
  const { handleAiCheck, handleTranslate, handleChatCorrect } = useTranslationActions(
    session,
    settings,
    inputRefs,
    altButtonDown,
    setShowAiNotice,
    selectedLevel,
    selectedSubLevel,
  );

  // Helper Logic (could be moved to hooks later if complex)
  const setSentenceWithTranslation = useCallback(
    async (shuffleSentence: Boolean): Promise<void> => {
      // Capture current state to check for race conditions
      const startingLevel = selectedLevel;
      const startingSubLevel = selectedSubLevel;

      // Clear previous questions immediately to provide visual feedback and prevent stale data
      setAllRows([]);
      setCurrentBatchIndex(0);

      const translatedSentences = await getSentenceWithTranslation(selectedLevel + "", selectedSubLevel + "");

      // If exercise changed while request was in flight, ignore the results
      if (selectedLevel !== startingLevel || selectedSubLevel !== startingSubLevel) {
        return;
      }

      if (!translatedSentences || translatedSentences.length === 0) return;

      const hasGapFill =
        translatedSentences[0].translation.includes("{") && translatedSentences[0].translation.includes("}");
      const rowsWithMetadata = translatedSentences.map((item: Row, idx: number) => {
        if (hasGapFill) {
          item.gapTranslation = item.translation;
          item.translation = item.translation.replaceAll("{", "").replaceAll("}", "");
        }
        item.feedback = null;
        item.userInput = "";
        item.isLoading = false;
        return item;
      });

      const sentences = shuffleSentence ? shuffleArray(rowsWithMetadata) : rowsWithMetadata;
      const finalSentences = sentences.map((row: Row, idx: number) => ({
        ...row,
        id: `${selectedLevel}-${selectedSubLevel}-${idx}`,
        batchId: Math.floor(idx / BATCH_SIZE),
      }));

      setAllRows(finalSentences);
      setCurrentBatchIndex(0);
      dispatch(settingsActions.setHasGapFill(hasGapFill));
    },
    [selectedLevel, selectedSubLevel, dispatch, setAllRows, setCurrentBatchIndex, BATCH_SIZE],
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

  useEffect(() => {
    // Reset completion status and clear rows when switching exercises
    dispatch(settingsActions.setIsComplete(false));

    if (selectedLevel === "Incorrect Sentences") {
      // Clear rows first to avoid showing old data while Incorrect Sentences load (even if sync)
      setAllRows([]);
      setCurrentBatchIndex(0);
      loadIncorrectSentences();
    } else if (selectedLevel && selectedSubLevel) {
      setSentenceWithTranslation(shuffleSentences);
    }
  }, [
    selectedLevel,
    selectedSubLevel,
    shuffleSentences,
    setSentenceWithTranslation,
    loadIncorrectSentences,
    dispatch,
    setAllRows,
    setCurrentBatchIndex,
  ]);

  return (
    <>
      <GlobalStyle />
      <section style={{ display: "flex" }}>
        <input type="checkbox" id="toggle" hidden></input>
        <SideBar handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
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
      </section>
      <NoticeModal
        isOpen={showAiNotice}
        onClose={() => setShowAiNotice(false)}
        title="AI Feedback Restricted"
        message="AI feedback functionality is currently only available for authenticated users. Please log in to your account to enable AI support for your translation sessions."
      />
    </>
  );
};

export default App;

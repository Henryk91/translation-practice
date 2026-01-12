import React, { useCallback, useEffect, useRef, useState } from "react";

import { incorrectSentenceCount, initialLevelDict, noSubLevel } from "./data/levelSentences";
import {
  confirmTranslationCheck,
  getLevels,
  getSentenceWithTranslation,
  logUse,
  translateSentence,
} from "./helpers/requests";
import { GlobalStyle, Container, Table, TableRow } from "./helpers/style";
import { Row } from "./helpers/types";
import {
  focusNextInput,
  splitAndShuffle,
  updateRowFeedback,
  updateScore,
  checkLogin,
  initScores,
  parseUrlParams,
  updateUrl,
} from "./helpers/utils";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import TranslationArea from "./components/TranslationArea";
import CustomUserInput from "./components/CustomUserInput";
import SettingsRow, { QuickLevelChange } from "./components/SettingsRow";
import PageHeader from "./components/PageHeader";
import StickyProgressBar from "./components/StickyProgressBar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { uiActions } from "./store/ui-slice";
import { settingsActions } from "./store/settings-slice";
import Chat from "./Chat";
import { useNavigate, useLocation } from "react-router-dom";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const levels = useSelector((state: RootState) => state.ui.levels);
  const levelSentences = useSelector((state: RootState) => state.ui.levelSentences);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shouldSave, shuffleSentences, redoErrors, mode, useGapFill, chatUi } = settings;
  const hasInit = useRef(false);
  const urlInitialized = useRef(false);
  const pendingSubLevelFromUrl = useRef<string | null>(null);

  const BATCH_SIZE = 10;
  const [text, setText] = useState<string>("");
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [rows, setRows] = useState<Row[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [shiftButtonDown, setShiftButtonDown] = useState<boolean>(false);
  const [altButtonDown, setAltButtonDown] = useState<boolean>(false);

  const setChatUi = (val: boolean) => {
    dispatch(settingsActions.setChatUi(val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    const rowId = rows[index].id;
    setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
    setAllRows((current) => current.map((r) => (r.id === rowId ? { ...r, userInput: value } : r)));
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
        delete (row as any).isCorrect;
        delete (row as any).aiCorrect;
        delete (row as any).isRetry;
        return {
          ...row,
          id: `incorrect-${idx}`,
          batchId: Math.floor(idx / BATCH_SIZE),
          feedback: null,
          userInput: "",
          isLoading: undefined,
        };
      });
      setAllRows(newRows);
      setCurrentBatchIndex(0);
    }
  }, [shuffleSentences, BATCH_SIZE]);

  const handleLevelChange = (level: string): void => {
    const text = level ? levelSentences[level] : "";
    dispatch(uiActions.setLevel({ level: level }));

    if (level) localStorage.setItem("selectedLevel", level);
    if (level === "Incorrect Sentences") {
      dispatch(uiActions.setSubLevels(undefined));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      updateUrl(level, undefined, navigate);
      return;
    }

    if (typeof text === "string") {
      const sentences = splitAndShuffle(text);
      dispatch(uiActions.setSubLevels(undefined));

      setText(text);
      const sentencesWithIds = sentences.map((sentence, idx) => ({
        sentence,
        userInput: "",
        translation: "",
        feedback: null,
        id: `${level}-none-${idx}`,
        batchId: Math.floor(idx / BATCH_SIZE),
      }));
      setAllRows(sentencesWithIds);
      setCurrentBatchIndex(0);
      updateUrl(level, undefined, navigate);
    } else if (typeof text === "object") {
      setText("");
      setRows([]);
      dispatch(uiActions.setSubLevels(text));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      updateUrl(level, undefined, navigate);
    }
  };

  const handleSubLevelChange = (subLevel: string): void => {
    dispatch(uiActions.setSubLevel({ subLevel: subLevel }));
    localStorage.setItem("selectedSubLevel", subLevel);
    if (selectedLevel) updateUrl(selectedLevel, subLevel, navigate);
  };

  const shuffleRow = (rows: Row[]): Row[] => {
    const shuffled = [...rows];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getTranslateSentence = useCallback(() => {
    getLevels().then((data) => {
      if (data) {
        const newLevelSentences = { ...initialLevelDict, ...data };
        dispatch(uiActions.setLevelSentences(newLevelSentences));
        dispatch(uiActions.setLevels(Object.keys(newLevelSentences)));
      }
    });
  }, [dispatch]);

  const setSentenceWithTranslation = useCallback(
    async (shuffleSentence: Boolean): Promise<void> => {
      const translatedSentences = await getSentenceWithTranslation(selectedLevel + "", selectedSubLevel + "");
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

      const sentences = shuffleSentence ? shuffleRow(rowsWithMetadata) : rowsWithMetadata;
      const finalSentences = sentences.map((row: Row, idx: number) => ({
        ...row,
        id: `${selectedLevel}-${selectedSubLevel}-${idx}`,
        batchId: Math.floor(idx / BATCH_SIZE),
      }));

      setAllRows(finalSentences);
      setCurrentBatchIndex(0);
      dispatch(settingsActions.setHasGapFill(hasGapFill));
    },
    [selectedLevel, selectedSubLevel, dispatch]
  );

  const redoSentences = (rows: Row[]) => {
    const filteredRows = allRows.filter((row: Row) => !row.isRetry);
    const cleanRows = filteredRows.map((row: Row, idx: number) => {
      const { id, batchId, ...rest } = row;
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
        const retryRowTemplate = { ...updatedRow, userInput: "", feedback: null, isRetry: true, batchId: row.batchId };
        delete (retryRowTemplate as any).aiCorrect;
        delete (retryRowTemplate as any).isCorrect;

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

  const handleAiCheck = async (index: number, lastInput: HTMLInputElement | undefined): Promise<void> => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    const isCorrect = row.isCorrect;
    if (!row.userInput || (isCorrect === undefined && !altButtonDown) || isCorrect === true) {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
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
      isTranslationCorrect
    );
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));

    // Update allRows with the main change first
    setAllRows((current) => current.map((r) => (r.id === row.id ? updatedRow : r)));

    // Then handle retry rows (which updates both newRows and allRows)
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    setRows(newRows);

    if (shouldSave) updateScore(allRows, selectedLevel, selectedSubLevel);
    if (isTranslationCorrect) {
      focusNextInput(lastInput);
    } else {
      lastInput?.focus();
    }
  };

  const handleTranslate = async (index: number, event: HTMLInputElement | undefined): Promise<void> => {
    if (altButtonDown) {
      await handleAiCheck(index, event);
      return;
    }
    setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    if (!row.userInput) {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    if (event) focusNextInput(event);
    const translated = row.translation ? row.translation : await translateSentence(row.sentence);

    const wasFalse = row.isCorrect === false || row.aiCorrect === false;
    const updatedRow = updateRowFeedback(mode, row, translated, row.aiCorrect);
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));

    // Update allRows with the main change first
    setAllRows((current) => current.map((r) => (r.id === row.id ? updatedRow : r)));

    // Then handle retry rows (which updates both newRows and allRows)
    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    if (shouldSave) updateScore(allRows, selectedLevel, selectedSubLevel);
    setRows(newRows);

    const currentBatchComplete = newRows.every((row) => row.feedback);
    dispatch(settingsActions.setIsComplete(currentBatchComplete));
  };

  const handleChatCorrect = useCallback(
    (row: Row, userInput: string) => {
      const updatedRow = updateRowFeedback(mode, { ...row, userInput }, row.translation, true);

      // Update allRows first to ensure progress bar has latest data
      setAllRows((current) => {
        const next = current.map((r) => (r.id === row.id ? updatedRow : r));
        if (shouldSave) updateScore(next, selectedLevel, selectedSubLevel);
        return next;
      });

      // Update rows (current batch)
      setRows((current) => {
        const next = current.map((r) => (r.id === row.id ? updatedRow : r));
        const currentBatchComplete = next.every((r) => r.feedback);
        dispatch(settingsActions.setIsComplete(currentBatchComplete));
        return next;
      });
    },
    [mode, shouldSave, selectedLevel, selectedSubLevel, dispatch]
  );

  const handleNextBatch = (previous?: boolean) => {
    if (previous) {
      // For backward navigation, always go to previous exercise
      nextExercise(true);
      return;
    }

    const maxBatchId = allRows.length > 0 ? Math.max(...allRows.map((r) => r.batchId || 0)) : 0;
    const hasMoreBatches = currentBatchIndex < maxBatchId;

    if (hasMoreBatches) {
      // Move to next batch
      setCurrentBatchIndex(currentBatchIndex + 1);
      dispatch(settingsActions.setIsComplete(false));
    } else {
      // All batches complete, go to next exercise
      nextExercise();
    }
  };

  const nextExercise = (previous?: boolean) => {
    if (!subLevels || !selectedSubLevel) return;
    const currentIndex = subLevels.indexOf(selectedSubLevel);
    if (currentIndex < 0) return;

    const canGoForwards = previous !== true && subLevels.length - 1 > currentIndex;
    const canGoBackwards = previous === true && currentIndex > 0;

    if (canGoForwards || canGoBackwards) {
      const nextInd = previous ? currentIndex - 1 : currentIndex + 1;
      handleSubLevelChange(subLevels[nextInd]);
      return;
    }

    const currentLevelIndex = levels.indexOf(`${selectedLevel}`);
    if (currentLevelIndex < 0) return;

    const nextLevelIndex = previous ? currentLevelIndex - 1 : currentLevelIndex + 1;
    const newLevel = levels[nextLevelIndex];
    const localSubLevels = levelSentences[newLevel];
    const newSubLevel = previous ? localSubLevels[localSubLevels.length - 1] : localSubLevels[0];

    handleLevelChange(newLevel as any);
    handleSubLevelChange(newSubLevel);
  };

  const clickSentenceAgain = (rows: Row[]) => {
    dispatch(settingsActions.setRedoErrors(false));
    dispatch(settingsActions.setIsComplete(false));
    setCurrentBatchIndex(0);
    if (noSubLevel.includes(selectedLevel as string)) {
      loadIncorrectSentences();
      return;
    }
    if (selectedSubLevel) {
      redoSentences(rows);
    }
  };

  useEffect(() => {
    if (selectedLevel === "Incorrect Sentences") {
      loadIncorrectSentences();
    } else if (selectedLevel && selectedSubLevel) {
      setSentenceWithTranslation(shuffleSentences);
    }
  }, [selectedLevel, selectedSubLevel, shuffleSentences, setSentenceWithTranslation, loadIncorrectSentences]);

  // Sync current batch with rows
  useEffect(() => {
    if (allRows.length > 0) {
      const currentBatch = allRows.filter((r) => r.batchId === currentBatchIndex);
      setRows(currentBatch);
    } else {
      setRows([]);
    }
  }, [allRows, currentBatchIndex]);

  const loadSettingsFromLocalStorage = useCallback(() => {
    const redoErrors = localStorage.getItem("redoErrors");
    if (redoErrors !== null) {
      dispatch(settingsActions.setRedoErrors(JSON.parse(redoErrors)));
    }

    const useGapFill = localStorage.getItem("useGapFill");
    if (useGapFill !== null) {
      dispatch(settingsActions.setUseGapFill(JSON.parse(useGapFill)));
    }
  }, [dispatch]);

  const handleIncorrectSentencesLevel = useCallback(
    (level: string, urlLevel: string | undefined, urlSubLevel: string | undefined) => {
      dispatch(uiActions.setSubLevels(undefined));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      if (!urlLevel || urlSubLevel) updateUrl(level, undefined, navigate);
    },
    [dispatch, navigate]
  );

  const handleLevelWithSubLevels = useCallback(
    (
      level: string,
      subLevelsArray: string[],
      subLevelToUse: string | null,
      urlLevel: string | undefined,
      urlSubLevel: string | undefined
    ) => {
      dispatch(uiActions.setSubLevels(subLevelsArray));
      dispatch(settingsActions.setShowLevels(false));

      if (!subLevelToUse) {
        // No sublevel specified, just set the level
        if (level && !urlLevel) updateUrl(level, undefined, navigate);
        return;
      }

      // Validate and set sublevel from URL
      if (subLevelsArray.includes(subLevelToUse)) {
        pendingSubLevelFromUrl.current = subLevelToUse;
        dispatch(uiActions.setSubLevel({ subLevel: subLevelToUse }));
        localStorage.setItem("selectedSubLevel", subLevelToUse);

        const urlHasChanged = !urlLevel || !urlSubLevel || urlLevel !== level || urlSubLevel !== subLevelToUse;
        if (urlHasChanged) updateUrl(level, subLevelToUse, navigate);
      } else {
        // Invalid sublevel in URL, remove it
        console.warn(`Sublevel "${subLevelToUse}" not found in level "${level}". Available sublevels:`, subLevelsArray);
        if (urlSubLevel) updateUrl(level, undefined, navigate);
      }
    },
    [dispatch, navigate]
  );

  const handleLevelWithStringContent = useCallback(
    (level: string, content: string, urlLevel: string | undefined) => {
      setText(content);
      if (level && !urlLevel) updateUrl(level, undefined, navigate);
    },
    [navigate]
  );

  // Read from URL on initial load
  useEffect(() => {
    if (urlInitialized.current || !levels.length || Object.keys(levelSentences).length === 0) return;

    const { level: urlLevel, subLevel: urlSubLevel } = parseUrlParams(location.pathname);
    const levelFromStorage = localStorage.getItem("selectedLevel");
    const subLevelFromStorage = localStorage.getItem("selectedSubLevel");

    // Prefer URL params over localStorage
    const levelToUse = urlLevel || levelFromStorage;
    const subLevelToUse = urlSubLevel || subLevelFromStorage || null;

    if (!levelToUse || !levels.includes(levelToUse)) return;

    urlInitialized.current = true;
    dispatch(uiActions.setLevel({ level: levelToUse }));
    localStorage.setItem("selectedLevel", levelToUse);

    // Handle special case: Incorrect Sentences
    if (levelToUse === "Incorrect Sentences") {
      handleIncorrectSentencesLevel(levelToUse, urlLevel, urlSubLevel);
      loadSettingsFromLocalStorage();
      return;
    }

    // Handle level content (either object with sublevels or string)
    const levelContent = levelSentences[levelToUse];
    if (typeof levelContent === "object" && Array.isArray(levelContent)) {
      handleLevelWithSubLevels(levelToUse, levelContent, subLevelToUse, urlLevel, urlSubLevel);
    } else if (typeof levelContent === "string") {
      handleLevelWithStringContent(levelToUse, levelContent, urlLevel);
    }

    loadSettingsFromLocalStorage();
  }, [
    levels,
    levelSentences,
    dispatch,
    location.pathname,
    navigate,
    handleIncorrectSentencesLevel,
    handleLevelWithSubLevels,
    handleLevelWithStringContent,
    loadSettingsFromLocalStorage,
  ]);

  // Set sublevel from URL after sublevels are loaded
  useEffect(() => {
    if (pendingSubLevelFromUrl.current && subLevels && subLevels.length > 0) {
      const subLevelToSet = pendingSubLevelFromUrl.current;
      if (subLevels.includes(subLevelToSet) && selectedSubLevel !== subLevelToSet) {
        dispatch(uiActions.setSubLevel({ subLevel: subLevelToSet }));
        localStorage.setItem("selectedSubLevel", subLevelToSet);
      }
      pendingSubLevelFromUrl.current = null;
    }
  }, [subLevels, selectedSubLevel, dispatch]);

  useEffect(() => {
    if (hasInit.current) return; // skip second call in development
    console.log("App initialized");
    hasInit.current = true;
    getTranslateSentence();
    const hasLoggedUse = sessionStorage.getItem("hasLoggedUse");
    if (!hasLoggedUse) {
      sessionStorage.setItem("hasLoggedUse", "true");
      logUse();
    }
    checkLogin();
    initScores();
  }, [getTranslateSentence]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftButtonDown(false);
      } else if (e.key === "Alt") {
        setAltButtonDown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftButtonDown(true);
      } else if (e.key === "Alt") {
        setAltButtonDown(true);
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <section style={{ display: "flex" }}>
        <input type="checkbox" id="toggle" hidden></input>
        <SideBar handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
        <Container className="main-page">
          <Header handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
          <StickyProgressBar rows={allRows} />
          <CustomUserInput
            setText={setText}
            text={text}
            setAllRows={setAllRows}
            rows={rows}
            setCurrentBatchIndex={setCurrentBatchIndex}
          />
          {chatUi ? (
            <Chat
              initialSentences={rows}
              hideChat={() => setChatUi(false)}
              goToNextLevel={() => handleNextBatch()}
              onCorrect={handleChatCorrect}
            />
          ) : (
            <>
              <Table>
                <PageHeader sentenceCount={rows.length} />
                {rows.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TranslationArea
                      {...{
                        idx,
                        row,
                        handleInputChange,
                        inputRef: inputRefs.current[idx],
                        handleTranslate,
                        handleAiCheck,
                        useGapFill,
                        shiftButtonDown,
                      }}
                    />
                  </TableRow>
                ))}
                <br />
              </Table>
              <SettingsRow />
              <QuickLevelChange
                nextExercise={handleNextBatch}
                clickSentenceAgain={() => clickSentenceAgain(rows)}
                hasMoreBatches={
                  currentBatchIndex < (allRows.length > 0 ? Math.max(...allRows.map((r: Row) => r.batchId || 0)) : 0)
                }
              />
            </>
          )}
        </Container>
      </section>
    </>
  );
};

export default App;

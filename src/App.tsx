import React, { useCallback, useEffect, useRef, useState } from "react";

import { incorrectSentenceCount, initialLevelDict, noSubLevel } from "./data/levelSentences";
import {
  confirmTranslationCheck,
  getLevels,
  getSentenceWithTranslation,
  logUse,
  translateSentence,
} from "./helpers/requests";
import { Dict } from "styled-components/dist/types";
import { GlobalStyle, Container, Table, TableRow } from "./helpers/style";
import { Row } from "./helpers/types";
import {
  focusNextInput,
  splitAndShuffle,
  updateRowFeedback,
  updateScore,
  checkLogin,
  initScores,
} from "./helpers/utils";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import TranslationArea from "./components/TranslationArea";
import CustomUserInput from "./components/CustomUserInput";
import SettingsRow, { QuickLevelChange } from "./components/SettingsRow";
import PageHeader from "./components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { uiActions } from "./store/ui-slice";
import { settingsActions } from "./store/settings-slice";
import Chat from "./Chat";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const levels = useSelector((state: RootState) => state.ui.levels);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shouldSave, shuffleSentences, redoErrors, mode, useGapFill, chatUi } = settings;

  const [levelSentences, setLevelSentences] = useState<Dict>(initialLevelDict);
  const hasInit = useRef(false);

  const [text, setText] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [initialSentences, setInitialSentences] = useState<any[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [shiftButtonDown, setShiftButtonDown] = useState<boolean>(false);
  const [altButtonDown, setAltButtonDown] = useState<boolean>(false);

  const setChatUi = (val: boolean) => {
    dispatch(settingsActions.setChatUi(val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
  };

  const loadIncorrectSentences = useCallback(() => {
    const userId = localStorage.getItem("userId") ?? "unknown";
    const storageKey = userId + "-incorrectRows";
    const alreadySaved = localStorage.getItem(storageKey);
    if (alreadySaved) {
      const savedRows = JSON.parse(alreadySaved);
      const shuffle = shuffleSentences ? shuffleRow(savedRows) : savedRows;
      const items = shuffle.length > incorrectSentenceCount ? shuffle.slice(0, incorrectSentenceCount) : shuffle;
      const newRows = items.map((row: Row) => {
        delete row.isCorrect;
        delete row.aiCorrect;
        delete row.isRetry;
        return {
          ...row,
          feedback: null,
          userInput: "",
          isLoading: undefined,
        };
      });
      setRows(newRows);
    }
  }, [shuffleSentences]);

  const handleLevelChange = (level: string): void => {
    const text = level ? levelSentences[level] : "";
    dispatch(uiActions.setLevel({ level: level }));

    if (level) localStorage.setItem("selectedLevel", level);
    if (level === "Incorrect Sentences") {
      dispatch(uiActions.setSubLevels(undefined));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      return;
    }

    if (typeof text === "string") {
      const sentences = splitAndShuffle(text);
      dispatch(uiActions.setSubLevels(undefined));

      setText(text);
      setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
      console.log("sentences", sentences);
      setInitialSentences(sentences.map((r: any) => ({ en: r.sentence, de: r.translation })));
    } else if (typeof text === "object") {
      setText("");
      setRows([]);
      dispatch(uiActions.setSubLevels(text));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
    }
  };

  const handleSubLevelChange = (subLevel: string): void => {
    dispatch(uiActions.setSubLevel({ subLevel: subLevel }));
    localStorage.setItem("selectedSubLevel", subLevel);
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
        setLevelSentences(newLevelSentences);
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
      const rows = translatedSentences.map((item: Row) => {
        if (hasGapFill) {
          item.gapTranslation = item.translation;
          item.translation = item.translation.replaceAll("{", "").replaceAll("}", "");
        }
        item.feedback = null;
        item.userInput = "";
        item.isLoading = false;
        return item;
      });

      const sentences = shuffleSentence ? shuffleRow(rows) : rows;
      setRows(sentences);
      setInitialSentences(sentences.map((r: any) => ({ en: r.sentence, de: r.translation })));
      dispatch(settingsActions.setHasGapFill(hasGapFill));
    },
    [selectedLevel, selectedSubLevel, dispatch]
  );

  const redoSentences = (rows: Row[]) => {
    const filteredRows = rows.filter((row: Row) => !row.isRetry);
    const cleanRows = filteredRows.map((row: Row) => {
      return {
        ...row,
        feedback: null,
        userInput: "",
        isLoading: undefined,
        isCorrect: undefined,
        aiCorrect: undefined,
      };
    });
    const sentences = shuffleSentences ? shuffleRow(cleanRows) : cleanRows;
    setRows(sentences);
  };

  const setRetryRows = (newRows: Row[], wasFalse: boolean, index: number, row: Row, updatedRow: Row) => {
    if (redoErrors && !row.isRetry) {
      if (wasFalse && (updatedRow.isCorrect || row.aiCorrect) && rows?.[index + 1]?.isRetry) {
        newRows.splice(index + 1, 3);
      } else if (!row.isRetry && updatedRow.isCorrect === false && !rows?.[index + 1]?.isRetry) {
        const retryRow = { ...updatedRow, userInput: "", feedback: null, isRetry: true };
        delete retryRow.aiCorrect;
        delete retryRow.isCorrect;
        newRows.splice(index + 1, 0, retryRow, retryRow, retryRow);
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

    setRetryRows(newRows, wasFalse, index, row, updatedRow);

    setRows(newRows);
    if (shouldSave) updateScore(newRows, selectedLevel, selectedSubLevel);
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

    setRetryRows(newRows, wasFalse, index, row, updatedRow);
    if (shouldSave) updateScore(newRows, selectedLevel, selectedSubLevel);
    setRows(newRows);

    const isComplete = newRows.every((row) => row.feedback);
    dispatch(settingsActions.setIsComplete(isComplete));
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

  useEffect(() => {
    const storedLevel = localStorage.getItem("selectedLevel");
    const storedSubLevel = localStorage.getItem("selectedSubLevel") || null;
    if (storedLevel) {
      dispatch(uiActions.setLevel({ level: storedLevel }));
      if (storedLevel === "Incorrect Sentences") {
        dispatch(uiActions.setSubLevels(undefined));
        dispatch(uiActions.setSubLevel({ subLevel: undefined }));
        localStorage.removeItem("selectedSubLevel");
        return;
      }
      const text = levelSentences[storedLevel];
      if (typeof text === "object") {
        dispatch(uiActions.setSubLevels(text));
        dispatch(settingsActions.setShowLevels(false));
      }

      const redoErrors = localStorage.getItem("redoErrors");
      if (redoErrors !== null) {
        dispatch(settingsActions.setRedoErrors(JSON.parse(redoErrors)));
      }

      const useGapFill = localStorage.getItem("useGapFill");
      if (useGapFill !== null) {
        dispatch(settingsActions.setUseGapFill(JSON.parse(useGapFill)));
      }
      if (typeof text === "string") setText(text);
    }
    if (storedSubLevel) {
      dispatch(uiActions.setSubLevel({ subLevel: storedSubLevel }));
    }
  }, [levels, levelSentences, dispatch]);

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
        <SideBar
          levelSentences={levelSentences}
          handleLevelChange={handleLevelChange}
          handleSubLevelChange={handleSubLevelChange}
        />
        <Container className="main-page">
          <Header handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
          <CustomUserInput
            setText={setText}
            text={text}
            setRows={setRows}
            rows={rows}
            levelSentences={levelSentences}
          />
          {chatUi ? (
            <Chat
              initialSentences={initialSentences}
              hideChat={() => setChatUi(false)}
              nextLevel={() => nextExercise()}
            />
          ) : (
            <>
              <Table>
                <PageHeader sentenceCount={rows.length} />
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
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
              <QuickLevelChange nextExercise={nextExercise} clickSentenceAgain={() => clickSentenceAgain(rows)} />
            </>
          )}
        </Container>
      </section>
    </>
  );
};

export default App;

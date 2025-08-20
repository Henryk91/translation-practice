import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";

import { levelSentences as defaultLevelSentences } from "./data/levelSentences";
import { Level as defaultLevels, SelectedLevelType } from "./helpers/types";
import {
  confirmTranslationCheck,
  getSentences,
  getSentenceWithTranslation,
  logUse,
  translateSentence,
} from "./helpers/requests";
import { Dict } from "styled-components/dist/types";
import { GlobalStyle, Container, Table, TableRow, MenuButton } from "./helpers/style";
import { Row } from "./helpers/types";
import {
  focusNextInput,
  getLevelScoreAverage,
  splitAndShuffle,
  updateRowFeedback,
  updateScore,
  checkLogin,
  initScores,
  hasIncorrectSentences,
} from "./helpers/utils";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import TranslationArea from "./components/TranslationArea";
import { faArrowLeft, faArrowRight, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const App: React.FC = () => {
  const initialLevelDict = useMemo(() => {
    const defaultVal = { "Own Sentences": "", "By Level": defaultLevelSentences };
    if (hasIncorrectSentences()) return { "Incorrect Sentences": "", ...defaultVal };
    return defaultVal;
  }, []);

  const [levelSentences, setLevelSentences] = useState<Dict>(initialLevelDict);
  const [levels, setLevels] = useState<any>(["By Level"]);
  const [subLevels, setSubLevels] = useState<any>();
  const hasInit = useRef(false);
  const [shouldSave, setShouldSave] = useState<boolean>(true);
  const [useGapFill, setUseGapFill] = useState<boolean>(true);
  const [shuffleSentences, setShuffleSentences] = useState<boolean>(true);
  const [hasGapFill, setHasGapFill] = useState<boolean>(true);
  const [showLevels, setShowLevels] = useState<boolean>(true);
  const [redoErrors, setRedoErrors] = useState<boolean>(false);
  const defaultText = defaultLevelSentences[defaultLevels.A21];
  const [useMic, setUseMic] = useState<boolean>(false);

  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<"easy" | "hard">("easy");
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<SelectedLevelType>();
  const [selectedSubLevel, setSelectedSubLevel] = useState<string | undefined>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [shiftButtonDown, setShiftButtonDown] = useState<boolean>(false);
  const [altButtonDown, setAltButtonDown] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
  };

  const loadIncorrectSentences = () => {
    const userId = localStorage.getItem("userId") ?? "unknown";
    const storageKey = userId + "-incorrectRows";
    const alreadySaved = localStorage.getItem(storageKey);
    if (alreadySaved) {
      const savedRows = JSON.parse(alreadySaved);
      const newRow = savedRows.map((row: Row) => {
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
      setRows(newRow);
    }
  };

  const handleLevelChange = (level: SelectedLevelType): void => {
    const text = level ? levelSentences[level] : "";
    setSelectedLevel(level);

    if (level) localStorage.setItem("selectedLevel", level);
    if (level === "Incorrect Sentences") {
      setSubLevels(undefined);
      setSelectedSubLevel(undefined);
      return;
    }

    if (typeof text === "string") {
      const sentences = splitAndShuffle(text);
      setSubLevels(null);

      setText(text);
      setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
    } else if (typeof text === "object") {
      const subLevels = Object.keys(text);
      setText("");
      setRows([]);
      setSubLevels(subLevels);
      setSelectedSubLevel(undefined);
      localStorage.removeItem("selectedSubLevel");
    }
  };

  const handleSubLevelChange = (subLevel: string): void => {
    setSelectedSubLevel(subLevel);
    localStorage.setItem("selectedSubLevel", subLevel);
    if (!selectedLevel) return;
    const obj = levelSentences[selectedLevel];
    const text = typeof obj === "object" ? obj[subLevel] : "";

    if (typeof text === "string") {
      setText(text);
    }
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
    getSentences().then((data) => {
      if (data) {
        const newLevelSentences = { ...initialLevelDict, ...data };
        setLevelSentences(newLevelSentences);

        const newLevelsKeys = Object.keys(newLevelSentences).reduce((acc: any, key: string) => {
          acc[key] = key;
          return acc;
        }, {});

        setLevels(newLevelsKeys);
      }
    });
  }, [initialLevelDict]);

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
      setHasGapFill(hasGapFill);
    },
    [selectedLevel, selectedSubLevel]
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
      if (wasFalse && (updatedRow.isCorrect || row.aiCorrect)) {
        newRows.splice(index + 1, 3);
      } else if (!row.isRetry && updatedRow.isCorrect === false && !rows?.[index + 1]?.isRetry) {
        const retryRow = { ...updatedRow, userInput: "", feedback: null, isRetry: true };
        delete retryRow.aiCorrect;
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
  };

  const configSetRedoErrors = (redoErrors: boolean) => {
    setRedoErrors(redoErrors);
    localStorage.setItem("redoErrors", JSON.stringify(redoErrors));
  };

  const configUseGapFill = () => {
    setUseGapFill(!useGapFill);
    localStorage.setItem("useGapFill", JSON.stringify(!useGapFill));
  };

  const nextExercise = (previous?: boolean) => {
    const currentIndex = subLevels.indexOf(selectedSubLevel);
    if (currentIndex < 0) return;

    const canGoForwards = previous !== true && subLevels.length - 1 > currentIndex;
    const canGoBackwards = previous === true && currentIndex > 0;

    if (canGoForwards || canGoBackwards) {
      const nextInd = previous ? currentIndex - 1 : currentIndex + 1;
      handleSubLevelChange(subLevels[nextInd]);
      return;
    }

    const levelList = Object.keys(levels);
    const currentLevelIndex = levelList.indexOf(`${selectedLevel}`);

    if (currentLevelIndex < 0) return;

    const nextLevelIndex = previous ? currentLevelIndex - 1 : currentLevelIndex + 1;
    const newLevel = levelList[nextLevelIndex];
    const localSubLevels = Object.keys(levelSentences[newLevel]);
    const newSubLevel = previous ? localSubLevels[localSubLevels.length - 1] : localSubLevels[0];

    handleLevelChange(newLevel as any);
    setSubLevels(localSubLevels);
    // setSelectedSubLevel(newSubLevel);

    handleSubLevelChange(newSubLevel);
  };

  const loadText = useCallback(() => {
    const sentences = splitAndShuffle(text);
    setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
  }, [text, setRows]);

  useEffect(() => {
    if (selectedLevel === "Incorrect Sentences") {
      loadIncorrectSentences();
    } else if (selectedLevel && selectedSubLevel) {
      if (selectedLevel !== "By Level") {
        setSentenceWithTranslation(shuffleSentences);
      } else {
        loadText();
      }
    }
  }, [selectedLevel, selectedSubLevel, shuffleSentences, loadText, setSentenceWithTranslation]);

  useEffect(() => {
    const storedLevel = localStorage.getItem("selectedLevel") as SelectedLevelType | null;
    const storedSubLevel = localStorage.getItem("selectedSubLevel") || null;
    if (storedLevel) {
      setSelectedLevel(storedLevel);
      const text = levelSentences[storedLevel];
      if (typeof text === "object") {
        const subLevels = Object.keys(text);
        setSubLevels(subLevels);
        setShowLevels(false);
      }

      const redoErrors = localStorage.getItem("redoErrors");
      if (redoErrors !== null) {
        setRedoErrors(JSON.parse(redoErrors));
      }

      const useGapFill = localStorage.getItem("useGapFill");
      if (useGapFill !== null) {
        setUseGapFill(JSON.parse(useGapFill));
      }
      if (typeof text === "string") setText(text);
    }
    if (storedSubLevel) {
      setSelectedSubLevel(storedSubLevel);
    }
  }, [levels, levelSentences, setUseGapFill, setRedoErrors, setShowLevels]);

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

  const levelScoreText = useMemo(
    () => (lvl: string) => {
      const subItems = Object.keys(levelSentences[lvl] || {}).length;
      const score = getLevelScoreAverage(lvl, subItems) || null;
      return score ? `(${score}%)` : "";
    },
    [levelSentences]
  );

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
        {/* For menu show hide  */}
        <input type="checkbox" id="toggle" hidden></input>
        <SideBar
          selectedLevel={selectedLevel}
          levels={levels}
          levelScoreText={levelScoreText}
          subLevels={subLevels}
          selectedSubLevel={selectedSubLevel}
          handleLevelChange={handleLevelChange}
          handleSubLevelChange={handleSubLevelChange}
          showLevels={showLevels}
          setShowLevels={setShowLevels}
        />
        <Container style={{ width: "-webkit-fill-available" }}>
          <Header
            redoErrors={redoErrors}
            setRedoErrors={configSetRedoErrors}
            handleLevelChange={handleLevelChange}
            handleSubLevelChange={handleSubLevelChange}
            selectedLevel={selectedLevel}
            levels={levels}
            subLevels={subLevels}
            selectedSubLevel={selectedSubLevel}
            mode={mode}
            setMode={setMode}
            setText={setText}
            text={text}
            setShuffleSentences={setShuffleSentences}
            shuffleSentences={shuffleSentences}
            setShouldSave={setShouldSave}
            shouldSave={shouldSave}
            hasGapFill={hasGapFill}
            useGapFill={useGapFill}
            configUseGapFill={configUseGapFill}
            setRows={setRows}
            rows={rows}
            levelSentences={levelSentences}
            setUseMic={setUseMic}
            useMic={useMic}
          />
          {rows.length > 0 && (
            <Table>
              <div>
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <MenuButton
                    style={{ fontSize: "15px", display: "flex", alignItems: "center" }}
                    onClick={() => {
                      nextExercise(true);
                    }}
                  >
                    <FontAwesomeIcon style={{ color: "green", fontSize: "25px" }} icon={faArrowLeft} />
                    Prev Exercise
                  </MenuButton>
                  <MenuButton
                    onClick={() => {
                      if (selectedSubLevel) redoSentences(rows);
                    }}
                    style={{ color: shuffleSentences ? "green" : "red" }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                    <div style={{ fontSize: "12px", color: "white" }}>Again</div>
                  </MenuButton>
                  <MenuButton
                    style={{ fontSize: "15px", display: "flex", alignItems: "center" }}
                    onClick={() => {
                      nextExercise();
                    }}
                  >
                    Next Exercise <FontAwesomeIcon style={{ color: "green", fontSize: "25px" }} icon={faArrowRight} />
                  </MenuButton>
                </div>
                <br />
              </div>
            </Table>
          )}
        </Container>
      </section>
    </>
  );
};

export default App;

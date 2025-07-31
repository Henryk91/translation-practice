import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faTrash,
  faLanguage,
  faSyncAlt,
  faBrain,
  faSave,
  faHighlighter,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

import { levelSentences as defaultLevelSentences } from "./data/levelSentences";
import { Level as defaultLevels, SelectedLevelType } from "./types";
import { logUse } from "./helpers/requests";
import { Dict } from "styled-components/dist/types";
import {
  GlobalStyle,
  Container,
  Header,
  FeedbackSpan,
  Label,
  Select,
  TextAreaWrapper,
  TextArea,
  TextAreaButtonWrapper,
  Button,
  Table,
  TableColGroup,
  TableRow,
  TableCell,
  InputWrapper,
  FeedBackTableCell,
  Image,
} from "./style";
import { Row } from "./types";
import { focusNextInput, splitAndShuffle, splitSentences, updateRowFeedback, updateScore } from "./utils";
import { SubLevelOption } from "./subLevel";
import InputSwitcher from "./InputSwitcher";

const App: React.FC = () => {
  const initialLevelDict = useMemo(() => {
    return { "Own Sentences": "", "By Level": defaultLevelSentences };
  }, []);
  const [levelSentences, setLevelSentences] = useState<Dict>(initialLevelDict);
  const [levels, setLevels] = useState<any>(["By Level"]);
  const [subLevels, setSubLevels] = useState<any>();
  const hasInit = useRef(false);
  const [shouldSave, setShouldSave] = useState<boolean>(true);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [useGapFill, setUseGapFill] = useState<boolean>(false);
  const [shuffleSentences, setShuffleSentences] = useState<boolean>(true);
  const [hasGapFill, setHasGapFill] = useState<boolean>(true);
  const defaultText = defaultLevelSentences[defaultLevels.A21];

  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<"easy" | "hard">("easy");
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<SelectedLevelType>();
  const [selectedSubLevel, setSelectedSubLevel] = useState<string | undefined>();
  const [lastEdited, setLastEdited] = useState<HTMLInputElement | undefined>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value as defaultLevels;
    const text = levelSentences[level];
    setSelectedLevel(level);
    localStorage.setItem("selectedLevel", level);

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

  const handleSubLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const subLevel = e.target.value as any;

    setSelectedSubLevel(subLevel);
    localStorage.setItem("selectedSubLevel", subLevel);
    if (!selectedLevel) return;
    const obj = levelSentences[selectedLevel];
    const text = typeof obj === "object" ? obj[subLevel] : "";

    if (typeof text === "string") {
      setText(text);
    }
  };

  const initTranslatedSentences = async () => {
    setLoadingTranslation(true);
    const originalSentences = rows.map((row) => row.sentence).join(" ");
    const response = await translateSentence(originalSentences);
    const translatedSentences = splitSentences(response);
    const updated = rows.map((row, i) => {
      row.translation = translatedSentences[i];
      return row;
    });

    setRows(updated);
    setLoadingTranslation(false);
  };

  const shuffleRow = (rows: Row[]): Row[] => {
    const shuffled = [...rows];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleTextClear = (): void => {
    setText("");
  };

  const handleTextSubmit = (): void => {
    let textToSplit = text;
    if (!text && selectedLevel) {
      textToSplit = levelSentences[selectedLevel] as string;
      setText(textToSplit);
    }
    const sentences = selectedLevel === "Own Sentences" ? splitSentences(textToSplit) : splitAndShuffle(textToSplit);
    setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
  };

  const getTranslateSentence = useCallback(() => {
    fetch("https://note.henryk.co.za/api/full-translate-practice")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const newLevelSentences = { ...initialLevelDict, ...data };
          setLevelSentences(newLevelSentences);

          const newLevelsKeys = Object.keys(newLevelSentences).reduce((acc: any, key: string) => {
            acc[key] = key;
            return acc;
          }, {});

          setLevels(newLevelsKeys);
        }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, [initialLevelDict]);

  const getSentenceWithTranslation = useCallback(async (): Promise<any> => {
    const encodedSelectedLevel = encodeURIComponent(`${selectedLevel}`);
    const encodedSelectedSubLevel = encodeURIComponent(`${selectedSubLevel}`);

    try {
      const res = await fetch(
        `https://note.henryk.co.za/api/saved-translation?level=${encodedSelectedLevel}&subLevel=${encodedSelectedSubLevel}`
      );

      if (!res.ok) {
        return "Error loading. Try again.";
      }

      const response = await res.json();
      return response;
    } catch (error) {
      console.error("Error:", error);
      return "Error loading. Try again.";
    }
  }, [selectedLevel, selectedSubLevel]);

  const setSentenceWithTranslation = useCallback(
    async (shuffleSentence: Boolean): Promise<void> => {
      const translatedSentences = await getSentenceWithTranslation();
      if (!translatedSentences || translatedSentences.length === 0) return;

      let hasGapFill = false;
      const rows = translatedSentences.map((item: Row) => {
        if (!hasGapFill && item.translation.includes("{") && item.translation.includes("}")) {
          hasGapFill = true;
        }
        if (!useGapFill) {
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
    [getSentenceWithTranslation, useGapFill]
  );

  const translateSentence = async (sentence: string): Promise<string> => {
    try {
      const res = await fetch("https://note.henryk.co.za/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });

      if (!res.ok) {
        return "Error loading. Try again.";
      }

      const { translated } = await res.json();
      return translated;
    } catch (error) {
      console.error("Error:", error);
      return "Error loading. Try again.";
    }
  };

  const confirmTranslationCheck = useCallback(async (english: string, german: string): Promise<boolean> => {
    if (!english || !german) return false;

    try {
      const res = await fetch("https://note.henryk.co.za/api/confirm-translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english, german }),
      });

      if (!res.ok) {
        return false;
      }

      const { isCorrect } = await res.json();
      console.log("isCorrect", isCorrect);
      return isCorrect;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }, []);

  const handleAiCheck = async (index: number): Promise<void> => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    const isCorrect = row.isCorrect;
    if (!row.userInput || isCorrect === undefined || isCorrect === true) {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    const promptWords = row.sentence;
    const checkSentence = row.userInput.replaceAll("{", "").replaceAll("}", "");
    const isTranslationCorrect = await confirmTranslationCheck(promptWords, checkSentence);

    const updatedRow = updateRowFeedback(
      mode,
      row,
      isTranslationCorrect ? row.userInput : row.translation,
      isTranslationCorrect
    );
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));
    setRows(newRows);
    if (shouldSave) updateScore(newRows, selectedLevel, selectedSubLevel);
  };

  const handleTranslate = async (index: number, event: HTMLInputElement | undefined): Promise<void> => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    if (!row.userInput) {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    if (event) focusNextInput(event);
    const translated = row.translation ? row.translation : await translateSentence(row.sentence);

    const updatedRow = updateRowFeedback(mode, row, translated, row.aiCorrect);
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));
    if (shouldSave) updateScore(newRows, selectedLevel, selectedSubLevel);
    setRows(newRows);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    setLastEdited(e.target as HTMLInputElement);
    if (e.key === "Enter") {
      e.preventDefault();
      handleTranslate(index, e.target as HTMLInputElement);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
  };

  const shouldShowCheck = (row: Row) => {
    return row.isCorrect === undefined || row.isCorrect === true;
  };

  const configUseGapFill = () => {
    setUseGapFill(!useGapFill);
    localStorage.setItem("useGapFill", JSON.stringify(!useGapFill));
  };

  const loadText = useCallback(() => {
    const sentences = splitAndShuffle(text);
    setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
  }, [text, setRows]);

  useEffect(() => {
    if (selectedLevel && selectedSubLevel) {
      if (selectedLevel !== "By Level") {
        setSentenceWithTranslation(shuffleSentences);
      } else {
        loadText();
      }
    }
  }, [selectedLevel, selectedSubLevel, shuffleSentences, loadText, setSentenceWithTranslation]);

  useEffect(() => {
    const storedLevel = localStorage.getItem("selectedLevel") as defaultLevels | null;
    const storedSubLevel = localStorage.getItem("selectedSubLevel") || null;
    if (storedLevel) {
      setSelectedLevel(storedLevel);
      const text = levelSentences[storedLevel];
      if (typeof text === "object") {
        const subLevels = Object.keys(text);
        setSubLevels(subLevels);
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
  }, [levels, levelSentences, setUseGapFill]);

  useEffect(() => {
    console.log("App initialized");
    if (hasInit.current) return; // skip second call in development
    hasInit.current = true;
    getTranslateSentence();
    const hasLoggedUse = sessionStorage.getItem("hasLoggedUse");
    if (!hasLoggedUse) {
      sessionStorage.setItem("hasLoggedUse", "true");
      logUse();
    }
  }, [getTranslateSentence]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <h1>
            <Image src={process.env.PUBLIC_URL + "/logo192.png"} alt="App Logo" width="70" height="70" /> <br />
            <FeedbackSpan $correct={false}>Translate</FeedbackSpan> to{" "}
            <FeedbackSpan $correct={true}> German </FeedbackSpan>
          </h1>
          <div>
            <Label>Level:</Label>
            <Select
              placeholder="Select your Language Level"
              value={selectedLevel || "Select your Language Level"}
              onChange={handleLevelChange}
            >
              <option disabled>Select your Language Level</option>
              {Object.values(levels as defaultLevels).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.toUpperCase()}
                </option>
              ))}
            </Select>
            {subLevels && (
              <>
                <Select value={selectedSubLevel || "Select Sub Level"} onChange={handleSubLevelChange}>
                  <option disabled>Select Sub Level</option>
                  {Object.values(subLevels as defaultLevels).map((lvl) => (
                    <SubLevelOption key={lvl} selectedLevel={selectedLevel} subLevel={lvl} />
                  ))}
                </Select>
              </>
            )}
            {selectedLevel !== "Own Sentences" && (
              <>
                <Label>Mode:</Label>
                <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="hard">Hard</option>
                </Select>
              </>
            )}
          </div>
          <TextAreaWrapper>
            {selectedLevel === "Own Sentences" && (
              <TextArea
                placeholder="Enter English text..."
                value={text}
                onChange={(e: any) => setText(e.target.value)}
              />
            )}

            <TextAreaButtonWrapper>
              {selectedLevel !== "Own Sentences" && (
                <>
                  <Button
                    onClick={() => setShuffleSentences(!shuffleSentences)}
                    style={{ color: shuffleSentences ? "green" : "red" }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                  </Button>
                  <Button onClick={() => setShouldSave(!shouldSave)} style={{ color: shouldSave ? "green" : "red" }}>
                    <FontAwesomeIcon icon={faSave} />
                  </Button>

                  <Button
                    disabled={!hasGapFill}
                    onClick={() => configUseGapFill()}
                    style={{ color: useGapFill && hasGapFill ? "red" : "currentcolor" }}
                  >
                    <FontAwesomeIcon icon={useGapFill && hasGapFill ? faEdit : faHighlighter} />
                  </Button>
                </>
              )}

              {selectedLevel === "Own Sentences" && (
                <>
                  <Button onClick={handleTextSubmit}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </Button>
                  <Button onClick={handleTextClear}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                  <Button onClick={initTranslatedSentences} disabled={loadingTranslation || rows.length === 0}>
                    <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "5px" }} />
                    <FontAwesomeIcon icon={faSyncAlt} spin={loadingTranslation} />
                  </Button>
                </>
              )}
            </TextAreaButtonWrapper>
          </TextAreaWrapper>
        </Header>
        {rows.length > 0 && (
          <Table>
            <TableColGroup>
              <col />
              <col />
              <col />
            </TableColGroup>
            <tbody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell style={{ justifyContent: "space-between" }}>
                    <span>{idx + 1}. </span>
                    <span style={{ width: "-webkit-fill-available" }}>{row.sentence}</span>
                  </TableCell>
                  <TableCell key={`${idx}-input`}>
                    <InputWrapper>
                      <InputSwitcher
                        template={row.translation}
                        userInput={row.userInput}
                        onChange={(e: any) => handleInputChange(e, idx)}
                        onKeyPress={(e: any) => handleKeyPress(e, idx)}
                        triggerNext={focusNextInput}
                        setLastEdited={setLastEdited}
                        inputRef={(el: any) => (inputRefs.current[idx] = el)}
                      />
                      <>
                        {shouldShowCheck(row) ? (
                          <Button
                            onClick={() => handleTranslate(idx, lastEdited)}
                            disabled={row.isLoading || !row.userInput}
                          >
                            <FontAwesomeIcon icon={row.isLoading ? faSpinner : faPaperPlane} spin={row.isLoading} />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAiCheck(idx)}
                            disabled={row.isLoading || row.isCorrect === undefined || !row.userInput}
                            style={{ color: row.aiCorrect === false ? "red" : "gray" }}
                          >
                            <FontAwesomeIcon icon={row.isLoading ? faSpinner : faBrain} spin={row.isLoading} />{" "}
                          </Button>
                        )}
                      </>
                    </InputWrapper>
                  </TableCell>
                  <FeedBackTableCell className="feedbackWrapper">
                    {row.feedback &&
                      row.feedback.map((fb, i) => (
                        <>
                          <FeedbackSpan className="punctuation" key={i} $correct={fb.correct}>
                            {fb.word}
                          </FeedbackSpan>{" "}
                          <></>
                        </>
                      ))}
                  </FeedBackTableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default App;

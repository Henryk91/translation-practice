import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner, faTrash, faLanguage, faSyncAlt, faBrain } from "@fortawesome/free-solid-svg-icons";

import { levelSentences as defaultLevelSentences } from "./data/levelSentences";
import { Level as defaultLevels } from "./types";
import { logUse } from "./helpers/requests";
import { Dict } from "styled-components/dist/types";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #121212;
    color: #e0e0e0;
    font-family: sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 20px;
  padding: 0;
  width: 100vw;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 0;
  }
`;

const Image = styled.img`
  border-radius: 5px;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: column;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Label = styled.label`
  margin-right: 10px;
  color: #e0e0e0;
`;

const Select = styled.select`
  margin-right: 20px;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-size: 18px;
  text-align: center;

  @media (max-width: 600px) {
    margin: 0 0 10px 0;
    width: 100%;
  }
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: -webkit-fill-available;
`;
const TextInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: 300px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  width: fit-content;
  white-space: nowrap;
  &:hover {
    background-color: #444;
  }

  @media (min-width: 600px) {
    margin: 5px;
  }
`;

const Table = styled.table`
  // width: 100%;
  // max-width: 800px;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0 auto;
  max-width: 80%;
  @media (max-width: 600px) {
    max-width: none;
    width: 100vw;
    margin: 0;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #333;
  max-width: 100vw;
  width: 100%;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  // gap: 20px;
  // width: max-content;
  align-content: center;

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-items: center;
    // width: 100vw;
    overflow: hidden;
    padding: 3px;
  }
`;

const TableColGroup = styled.colgroup`
  display: flex;
  col {
    width: 33%;
    flex: 1; /* each .col takes equal share of available space */
    /* optional spacing */
    padding: 0 10px;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  // width: 33%;
  text-align: center;
  flex: 1;

  @media (min-width: 600px) {
    align-items: center;
    justify-content: center;
    display: flex;
  }
  @media (max-width: 600px) {
    display: block;
    width: 95vw;
    text-align: left;
    padding: 8px 10px;
  }
`;

const FeedBackTableCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  margin: 10px;
  flex: 1;

  @media (min-width: 600px) {
    align-items: center;
    justify-content: center;
    display: flex;
  }

  @media (max-width: 600px) {
    width: 95vw;
    text-align: left;
    padding: 8px 10px;
    margin: unset;
  }
`;

const TextAreaButtonWrapper = styled.div`
  margin: 5px;
  Button {
    margin: 5px;
  }
`;

const TextAreaWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 5px;
  width: 100%;
  @media (min-width: 600px) {
    flex-direction: column;
  }
  @media (max-width: 600px) {
    align-items: stretch;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 600px) {
    align-items: stretch;
  }
`;

const FeedbackSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "#00ff00" : "#ff4444")};
  margin-right: 4px;
`;

interface FeedbackWord {
  word: string;
  correct: boolean;
}

interface Row {
  sentence: string;
  userInput: string;
  translation: string;
  feedback: FeedbackWord[] | null;
  isLoading?: boolean;
  isCorrect?: boolean;
  aiCorrect?: boolean;
}

const updateScore = (
  rows: Row[],
  selectedLevel: defaultLevels | undefined,
  selectedSubLevel: string | undefined
): void => {
  let totalCount = 0;
  let correctCount = 0;
  rows.forEach((row) => {
    if (row.hasOwnProperty("isCorrect")) {
      totalCount++;
      if (row.isCorrect) {
        correctCount++;
      }
    }
  });
  const score = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(0) : "0";
  localStorage.setItem(`${selectedLevel}-${selectedSubLevel}`, score);
};

function SubLevelOption({ selectedLevel, subLevel }: { selectedLevel: string | undefined; subLevel: string }) {
  const getLevelScore = (level: string, subLevel: string): string | null => {
    return localStorage.getItem(`${level}-${subLevel}`) || null;
  };

  const levelScoreElements = (selectedLevel: string | undefined, subLevel: string) => {
    const score = getLevelScore(selectedLevel || "", subLevel);
    return score ? `(${score}%)` : "";
  };

  return (
    <option key={subLevel} value={subLevel}>
      {levelScoreElements(selectedLevel, subLevel)} {subLevel.toUpperCase()}
    </option>
  );
}

const updateRowFeedback = (
  mode: "easy" | "hard",
  row: Row,
  translated: string,
  aiCorrect: boolean | undefined
): Row => {
  const germanWords = translated.split(" ");
  const userWords = row.userInput.split(" ");

  let isCorrect = true;
  const feedback = germanWords.map((gw, i) => {
    const uw = userWords[i] || "";
    const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, "").toLowerCase();
    const correct = mode === "hard" ? uw === gw : normalize(uw) === normalize(gw);
    if (!correct) {
      isCorrect = false;
    }
    return { word: gw, correct };
  });
  console.log("aiCorrect", aiCorrect);
  return { ...row, translation: translated, feedback, isLoading: false, isCorrect, aiCorrect };
};

const App: React.FC = () => {
  const initialLevelDict = useMemo(() => {
    return { "By Level": defaultLevelSentences };
  }, []);
  const [levelSentences, setLevelSentences] = useState<Dict>(initialLevelDict);
  const [levels, setLevels] = useState<any>(["By Level"]);
  const [subLevels, setSubLevels] = useState<any>();
  const hasInit = useRef(false);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const defaultText = defaultLevelSentences[defaultLevels.A21];

  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<"easy" | "hard">("easy");
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<defaultLevels | undefined>();
  const [selectedSubLevel, setSelectedSubLevel] = useState<string | undefined>();
  const [aiCheckIndex, setAiCheckIndex] = useState<number | undefined>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusNext = (index: number) => {
    inputRefs.current[index + 1]?.focus();
  };

  const splitSentences = (input: string): string[] =>
    input
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

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
      //   const sentences = splitAndShuffle(text);
      setText(text);
      //   setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
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

  const splitAndShuffle = (input: string): string[] => {
    const sentences = splitSentences(input);
    return shuffleStrings(sentences);
  };

  const shuffleStrings = (input: string[]): string[] => {
    // Make a shallow copy to avoid mutating the original array
    const array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    const sentences = splitAndShuffle(textToSplit);
    setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
  };

  const setUnShuffledText = async () => {
    const translatedSentences = await getSentenceWithTranslation();

    const rows = translatedSentences.map((item: Row) => {
      item.feedback = null;
      item.userInput = "";
      item.isLoading = false;
      return item;
    });
    setRows(rows);
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

  const setSentenceWithTranslation = useCallback(() => {
    const translatedSentences = getSentenceWithTranslation();

    translatedSentences
      .then((data) => {
        if (data) {
          const rows = data.map((item: Row) => {
            item.feedback = null;
            item.userInput = "";
            item.isLoading = false;
            return item;
          });
          const sentences = shuffleRow(rows);
          setRows(sentences);
        }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, [getSentenceWithTranslation]);

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

    const userWords = row.userInput;
    const promptWords = row.sentence;
    const isTranslationCorrect = await confirmTranslationCheck(promptWords, userWords);
    const updatedRow = updateRowFeedback(
      mode,
      row,
      isTranslationCorrect ? userWords : row.translation,
      isTranslationCorrect
    );
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));
    setRows(newRows);
    updateScore(newRows, selectedLevel, selectedSubLevel);
  };

  const handleAiCheckCB = useCallback(
    async (index: number): Promise<void> => {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

      const row = rows[index];
      const isCorrect = row.isCorrect;

      if (!row.userInput || isCorrect === undefined || isCorrect === true) {
        setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
        return;
      }

      const userWords = row.userInput;
      const promptWords = row.sentence;
      const isTranslationCorrect = await confirmTranslationCheck(promptWords, userWords);

      const updatedRow = updateRowFeedback(
        mode,
        row,
        isTranslationCorrect ? userWords : row.translation,
        isTranslationCorrect
      );

      const newRows = rows.map((r, i) => (i === index ? updatedRow : r));
      setRows(newRows);
      updateScore(newRows, selectedLevel, selectedSubLevel);
    },
    [rows, setRows, mode, confirmTranslationCheck, selectedLevel, selectedSubLevel]
  );

  const handleTranslate = async (index: number): Promise<void> => {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: true } : r)));

    const row = rows[index];
    if (!row.userInput) {
      setRows((current) => current.map((r, i) => (i === index ? { ...r, isLoading: false } : r)));
      return;
    }

    focusNext(index);
    const translated = row.translation ? row.translation : await translateSentence(row.sentence);

    const updatedRow = updateRowFeedback(mode, row, translated, row.aiCorrect);
    const newRows = rows.map((r, i) => (i === index ? updatedRow : r));
    updateScore(newRows, selectedLevel, selectedSubLevel);
    setRows(newRows);

    if (newRows[index].isCorrect === false) {
      setAiCheckIndex(index);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTranslate(index);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    setRows((current) => current.map((r, idx) => (idx === index ? { ...r, userInput: value } : r)));
  };

  const shouldShowCheck = (row: Row) => {
    return row.isCorrect === undefined || row.isCorrect === true;
  };

  useEffect(() => {
    if (selectedLevel && selectedSubLevel) {
      setSentenceWithTranslation();
    }
  }, [selectedLevel, selectedSubLevel, setSentenceWithTranslation]);

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
    }
    if (storedSubLevel) {
      setSelectedSubLevel(storedSubLevel);
    }
  }, [levels, levelSentences]);

  // useEffect(() => {
  //   if (aiCheckIndex !== undefined) {
  //     console.log("handleAiCheck called with index:", aiCheckIndex);
  //     handleAiCheckCB(aiCheckIndex);
  //     setAiCheckIndex(undefined); // reset after handling
  //   }
  // }, [aiCheckIndex, handleAiCheckCB]);

  useEffect(() => {
    console.log("App initialized");
    if (hasInit.current) return; // skip second call in development
    hasInit.current = true;
    getTranslateSentence();
    logUse();
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
            <Label>Mode:</Label>
            <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          <TextAreaWrapper>
            <TextArea placeholder="Enter English text..." value={text} onChange={(e: any) => setText(e.target.value)} />
            <TextAreaButtonWrapper>
              <Button onClick={setUnShuffledText}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </Button>
              <Button onClick={handleTextClear}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
              <Button onClick={handleTextSubmit}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
              <Button onClick={initTranslatedSentences} disabled={loadingTranslation || rows.length === 0}>
                <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "5px" }} />
                <FontAwesomeIcon icon={faSyncAlt} spin={loadingTranslation} />
              </Button>
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
                  <TableCell>{row.sentence}</TableCell>
                  <TableCell>
                    <InputWrapper>
                      <TextInput
                        ref={(el: any) => (inputRefs.current[idx] = el)}
                        value={row.userInput}
                        onChange={(e: any) => handleInputChange(e, idx)}
                        onKeyPress={(e: any) => handleKeyPress(e, idx)}
                      />
                      <>
                        {shouldShowCheck(row) ? (
                          <Button onClick={() => handleTranslate(idx)} disabled={row.isLoading || !row.userInput}>
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
                  <FeedBackTableCell>
                    {row.feedback &&
                      row.feedback.map((fb, i) => (
                        <FeedbackSpan key={i} $correct={fb.correct}>
                          {fb.word}
                        </FeedbackSpan>
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

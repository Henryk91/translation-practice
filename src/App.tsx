import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
`;

const TextInput = styled.input`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: 400px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  &:hover {
    background-color: #444;
  }
`;

const Table = styled.table`
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #333;
`;

const TableCell = styled.td`
  padding: 10px;
  vertical-align: top;
`;

const FeedbackSpan = styled.span<{ correct: boolean }>`
  margin-right: 4px;
  color: ${(props) => (props.correct ? "#00ff00" : "#ff4444")};
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
}

const App: React.FC = () => {
  const defaultText: string =
    "I have two cats. She likes to read books. They go to the park every Sunday. We are learning English. He works in a bank.";
  const [text, setText] = useState<string>(defaultText);
  const [rows, setRows] = useState<Row[]>([]);

  const splitSentences = (str: string): string[] => {
    return str
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleTextSubmit = (): void => {
    const sentences = splitSentences(text);
    const initialRows: Row[] = sentences.map((sentence) => ({
      sentence,
      userInput: "",
      translation: "",
      feedback: null,
    }));
    setRows(initialRows);
  };

  const translateSentence = async (sentence: string): Promise<string> => {
    const response = await fetch("https://translate.argosopentech.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: sentence,
        source: "en",
        target: "de",
        format: "text",
      }),
    });
    const data = await response.json();
    return data.translatedText;
  };

  const handleTranslate = async (index: number): Promise<void> => {
    const row = rows[index];
    if (!row.userInput) return;
    const translated = await translateSentence(row.sentence);
    const correctWords = translated.split(" ");
    const userWords = row.userInput.split(" ");
    const feedback: FeedbackWord[] = correctWords.map((word, i) => ({
      word: userWords[i] || "",
      correct: word === (userWords[i] || ""),
    }));

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...row, translation: translated, feedback };
      return updated;
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTranslate(index);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number): void => {
    const value = e.target.value;
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], userInput: value };
      return updated;
    });
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <TextInput placeholder="Enter English text..." value={text} onChange={(e: any) => setText(e.target.value)} />
          <Button onClick={handleTextSubmit}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </Button>
        </Header>
        {rows.length > 0 && (
          <Table>
            <tbody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.sentence}</TableCell>
                  <TableCell>
                    {row.feedback === null ? (
                      <>
                        <TextInput
                          value={row.userInput}
                          onChange={(e: any) => handleInputChange(e, idx)}
                          onKeyPress={(e: any) => handleKeyPress(e, idx)}
                        />
                        <Button onClick={() => handleTranslate(idx)}>
                          <FontAwesomeIcon icon={faPaperPlane} />
                        </Button>
                      </>
                    ) : (
                      row.feedback.map((fb, i) => (
                        <FeedbackSpan key={i} correct={fb.correct}>
                          {fb.word}
                        </FeedbackSpan>
                      ))
                    )}
                  </TableCell>
                  <TableCell>{row.translation}</TableCell>
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

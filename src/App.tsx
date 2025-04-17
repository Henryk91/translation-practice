import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

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
  display: flex;
  align-items: center;
  margin-bottom: 20px;
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
`;

const TextInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
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
  &:hover { background-color: #444; }
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
  color: ${props => (props.correct ? '#00ff00' : '#ff4444')};
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
}

const App: React.FC = () => {
  const defaultText =
    'I have two cats. She likes to read books. They go to the park every Sunday. We are learning English. He works in a bank.';
  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [rows, setRows] = useState<Row[]>([]);

  const splitSentences = (input: string): string[] =>
    input
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

  const handleTextSubmit = (): void => {
    const sentences = splitSentences(text);
    setRows(
      sentences.map(sentence => ({
        sentence,
        userInput: '',
        translation: '',
        feedback: null,
      }))
    );
  };

  const translateSentence = async (sentence: string): Promise<string> => {
    const res = await fetch('http://localhost:5001/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence }),
    });
    const json = await res.json();
    return json.translated;
  };

  const handleTranslate = async (index: number): Promise<void> => {
    const row = rows[index];
    if (!row.userInput) return;

    const translated = await translateSentence(row.sentence);
    const germanWords = translated.split(' ');
    const userWords = row.userInput.split(' ');
    const feedback = germanWords.map((gw, i) => {
      const uw = userWords[i] || '';
      let correct: boolean;
      if (mode === 'easy') {
        const normalize = (s: string) =>
          s.replace(/[.,!?:;"-]/g, '').toLowerCase();
        correct = normalize(uw) === normalize(gw);
      } else {
        correct = uw === gw;
      }
      return { word: gw, correct };
    });

    setRows(current =>
      current.map((r, idx) =>
        idx === index
          ? { ...r, translation: translated, feedback }
          : r
      )
    );
  };

  const handleKeyPress = (e: any, index: number): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTranslate(index);
    }
  };

  const handleInputChange = (e: any, index: number): void => {
    const value = e.target.value;
    setRows(current =>
      current.map((r, idx) =>
        idx === index ? { ...r, userInput: value } : r
      )
    );
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Label>Mode:</Label>
          <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </Select>
          <TextInput
            placeholder="Enter English text..."
            value={text}
            onChange={(e: any) => setText(e.target.value)}
          />
          <Button onClick={handleTextSubmit}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </Button>
        </Header>

        {rows.length > 0 && (
          <Table>
            <tbody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {/* Left column: original English sentence unchanged */}
                  <TableCell>{row.sentence}</TableCell>

                  {/* Center column: user input box unchanged */}
                  <TableCell>
                    <TextInput
                      value={row.userInput}
                      onChange={(e: any) => handleInputChange(e, idx)}
                      onKeyPress={(e: any) => handleKeyPress(e, idx)}
                    />
                    <Button onClick={() => handleTranslate(idx)}>
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                  </TableCell>

                  {/* Right column: colored German translation words */}
                  <TableCell>
                    {row.feedback
                      ? row.feedback.map((fb, i) => (
                          <FeedbackSpan key={i} correct={fb.correct}>
                            {fb.word}
                          </FeedbackSpan>
                        ))
                      : null}
                  </TableCell>
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

import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { levelSentences } from './data/levelSentences';
import { Level } from "./types";

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

  @media (max-width: 600px) {
    padding: 0;
  }
`;

// Level buttons now span the full screen width and arrange into 2 rows of 3
const LevelButtons = styled.div`
  // display: grid;
  // grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  // width: 100vw;
  // margin: 0 10px 15px; /* negative side margin to neutralize Container padding */
  padding: 0 10px ;

  @media (max-width: 600px) {
    display: grid;
    margin: 5px;
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

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

  @media (max-width: 600px) {
    margin: 0 0 10px 0;
    width: 100%;
  }
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

  @media (max-width: 600px) {
    
    // margin: 0 0 8px 0;
  }
`;
// width: calc(100vw - 20px);

const Button = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  width: fit-content;
  white-space: nowrap;
  &:hover { background-color: #444; }

  @media (min-width: 600px) {
    margin: 5px;
    // width: calc(100vw - 20px);
  }
`;

const Table = styled.table`
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0 auto;

  @media (max-width: 600px) {
    max-width: none;
    width: 100vw;
    margin: 0;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #333;
  max-width: 100vw;

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-items: center;
    width: 100vw;
    overflow: hidden;
    padding: 3px
  }
`;

const TableCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  width: 33%;
  text-align: center;

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
  @media (max-width: 600px) {
    width: 95vw;
    text-align: left;
    padding: 8px 10px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 600px) {
    // flex-direction: column;
    align-items: stretch;
  }
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
  isLoading?: boolean;
}

const App: React.FC = () => {
  const defaultText = levelSentences[Level.A2];
  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [rows, setRows] = useState<Row[]>([]);

  const splitSentences = (input: string): string[] =>
    input.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  const handleLevelClick = (lvl: Level): void => {
    setText(levelSentences[lvl]);
    setRows([]);
  };

  const handleTextSubmit = (): void => {
    const sentences = splitSentences(text);
    setRows(sentences.map(sentence => ({ sentence, userInput: '', translation: '', feedback: null })));
  };

  const translateSentence = async (sentence: string): Promise<string> => {
    const res = await fetch('https://note.henryk.co.za/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence }),
    });
    const json = await res.json();
    return json.translated;
  };

  const handleTranslate = async (index: number): Promise<void> => {
    setRows(current =>
      current.map((r, i) => (i === index ? { ...r, isLoading: true } : r))
    );

    const row = rows[index];
    if (!row.userInput) {
      setRows(current =>
        current.map((r, i) => (i === index ? { ...r, isLoading: false } : r))
      );
      return;
    }

    const translated = await translateSentence(row.sentence);
    const germanWords = translated.split(' ');
    const userWords = row.userInput.split(' ');
    const feedback = germanWords.map((gw, i) => {
      const uw = userWords[i] || '';
      const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, '').toLowerCase();
      const correct = mode === 'hard' ? uw === gw : normalize(uw) === normalize(gw);
      return { word: gw, correct };
    });

    setRows(current =>
      current.map((r, i) =>
        i === index
          ? { ...r, translation: translated, feedback, isLoading: false }
          : r
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTranslate(index);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
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
        <LevelButtons>
          {[Level.A1, Level.A2, Level.B1, Level.B2, Level.C1, Level.C2].map(lvl => (
            <Button key={lvl} onClick={() => handleLevelClick(lvl)}>
              {lvl.toUpperCase()}
            </Button>
          ))}
        </LevelButtons>
        <Header>
          <Label>Mode:</Label>
          <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </Select>
          <InputWrapper>
            <TextInput
              placeholder="Enter English text..."
              value={text}
              onChange={(e: any) => setText(e.target.value)}
            />
            <Button onClick={handleTextSubmit}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </Button>
          </InputWrapper>
        </Header>
        {rows.length > 0 && (
          <Table>
            <colgroup>
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
            </colgroup>
            <tbody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.sentence}</TableCell>
                  <TableCell>
                    <InputWrapper>
                      <TextInput
                        value={row.userInput}
                        onChange={(e: any) => handleInputChange(e, idx)}
                        onKeyPress={(e: any) => handleKeyPress(e, idx)}
                      />
                      <Button onClick={() => handleTranslate(idx)} disabled={row.isLoading}>
                        <FontAwesomeIcon icon={row.isLoading ? faSpinner : faPaperPlane} spin={row.isLoading} />
                      </Button>
                    </InputWrapper>
                  </TableCell>
                  <FeedBackTableCell >
                    {row.feedback &&
                      row.feedback.map((fb, i) => (
                        <FeedbackSpan key={i} correct={fb.correct}>
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
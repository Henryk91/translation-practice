import React from "react";
import { Container, Table, TableRow } from "../helpers/style";
import Header from "./Header";
import StickyProgressBar from "./StickyProgressBar";
import CustomUserInput from "./CustomUserInput";
import Chat from "../Chat";
import PageHeader from "./PageHeader";
import TranslationArea from "./TranslationArea";
import SettingsRow, { QuickLevelChange } from "./SettingsRow";
import { Row } from "../types";

interface TranslationPracticeProps {
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  allRows: Row[];
  rows: Row[];
  selectedSubLevel: string | undefined;
  setText: (text: string) => void;
  text: string;
  setAllRows: (rows: any) => void;
  setCurrentBatchIndex: (index: number) => void;
  currentBatchIndex: number;
  chatUi: boolean;
  setChatUi: (val: boolean) => void;
  handleChatCorrect: (row: Row, userInput: string) => void;
  handleNextBatch: (previous?: boolean) => void;
  updateRowInput: (index: number, value: string) => void;
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>;
  handleTranslate: (index: number, event: HTMLInputElement | undefined, value?: string) => Promise<void>;
  handleAiCheck: (index: number, lastInput: HTMLInputElement | undefined) => Promise<void>;
  useGapFill: boolean;
  shiftButtonDown: boolean;
  clickSentenceAgain: (rows: Row[]) => void;
}

const TranslationPractice: React.FC<TranslationPracticeProps> = ({
  handleLevelChange,
  handleSubLevelChange,
  allRows,
  rows,
  selectedSubLevel,
  setText,
  text,
  setAllRows,
  setCurrentBatchIndex,
  currentBatchIndex,
  chatUi,
  setChatUi,
  handleChatCorrect,
  handleNextBatch,
  updateRowInput,
  inputRefs,
  handleTranslate,
  handleAiCheck,
  useGapFill,
  shiftButtonDown,
  clickSentenceAgain,
}) => {
  return (
    <Container className="main-page">
      <Header handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
      <StickyProgressBar rows={allRows} subLevel={selectedSubLevel} />
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
                  idx={idx}
                  row={row}
                  updateRowInput={updateRowInput}
                  inputRefs={inputRefs}
                  handleTranslate={handleTranslate}
                  handleAiCheck={handleAiCheck}
                  useGapFill={useGapFill}
                  shiftButtonDown={shiftButtonDown}
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
            anySentencesAttempted={allRows.some((r) => r.feedback)}
          />
        </>
      )}
    </Container>
  );
};

export default TranslationPractice;

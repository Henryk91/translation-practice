import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Table, TableRow } from "../helpers/style";
import Header from "./Header";
import StickyProgressBar from "./StickyProgressBar";
import CustomUserInput from "./CustomUserInput";
import Chat from "../Chat";
import PageHeader from "./PageHeader";
import TranslationArea from "./TranslationArea";
import SettingsRow, { QuickLevelChange } from "./SettingsRow";
import { Row } from "../types";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";

interface TranslationPracticeProps {
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  selectedSubLevel: string | undefined;
  setText: (text: string) => void;
  text: string;
  handleChatCorrect: (row: Row, userInput: string) => void;
  handleNextBatch: (previous?: boolean) => void;
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
  selectedSubLevel,
  setText,
  text,
  handleChatCorrect,
  handleNextBatch,
  inputRefs,
  handleTranslate,
  handleAiCheck,
  useGapFill,
  shiftButtonDown,
  clickSentenceAgain,
}) => {
  const dispatch = useDispatch();

  // Redux Selectors
  const { allRows, currentBatchIndex } = useSelector((state: RootState) => state.session);
  const { chatUi } = useSelector((state: RootState) => state.settings.settings);

  // Derived State
  const rows = useMemo(() => {
    return allRows.filter((r) => r.batchId === currentBatchIndex);
  }, [allRows, currentBatchIndex]);

  // Actions
  const setChatUi = (val: boolean) => dispatch(settingsActions.setChatUi(val));

  return (
    <Container className="main-page">
      <Header handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
      <StickyProgressBar rows={allRows} subLevel={selectedSubLevel} />
      <CustomUserInput setText={setText} text={text} />
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

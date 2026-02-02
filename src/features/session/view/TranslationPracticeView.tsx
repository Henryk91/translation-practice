import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Container, Table, TableRow } from "../../../helpers/style";
import Header from "../../navigation/Header";
import StickyProgressBar from "../components/StickyProgressBar";
import CustomUserInput from "../components/CustomUserInput";
import Chat from "../../../Chat";
import PageHeader from "../components/PageHeader";
import TranslationArea from "../components/TranslationArea";
import SettingsRow, { QuickLevelChange } from "../components/SettingsRow";
import { Row } from "../../../types";

interface TranslationPracticeViewProps {
  // Navigation/Configuration
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  selectedSubLevel: string | undefined;

  // Input State
  setText: (text: string) => void;
  text: string;
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>;
  shiftButtonDown: boolean;

  // Session State (from Redux/Container)
  allRows: Row[];
  currentBatchIndex: number;
  rows: Row[];
  chatUi: boolean;
  setAllRows: (rows: Row[]) => void;
  setCurrentBatchIndex: (index: number) => void;

  // Actions
  handleChatCorrect: (row: Row, userInput: string) => void;
  handleNextBatch: (previous?: boolean) => void;
  handleTranslate: (index: number, event: HTMLInputElement | undefined, value?: string) => Promise<void>;
  handleAiCheck: (index: number, lastInput: HTMLInputElement | undefined) => Promise<void>;
  clickSentenceAgain: (rows: Row[]) => void;
  setChatUi: (val: boolean) => void;

  // Settings
  useGapFill: boolean;
}

const TranslationPracticeView: React.FC<TranslationPracticeViewProps> = ({
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
  allRows,
  currentBatchIndex,
  rows,
  chatUi,
  setChatUi,
  setAllRows,
  setCurrentBatchIndex,
}) => {
  const methods = useForm({
    defaultValues: {
      translations: rows,
    },
    mode: "onChange",
  });

  const { reset, getValues } = methods;

  // Reset form when rows change (e.g. new batch), but check if IDs differ to avoid
  // wiping interactions if only feedback changed (though usually feedback includes userInput so it should be fine)
  useEffect(() => {
    const currentValues = getValues("translations");
    const currentIds = currentValues?.map((r: any) => r.id).join(",");
    const newIds = rows.map((r) => r.id).join(",");

    // Compare IDs to see if it's a new batch/set
    // Also if rows length changes
    if (currentIds !== newIds || rows.length !== currentValues?.length) {
      reset({ translations: rows });
    }
  }, [rows, reset, getValues]);

  return (
    <Container className="main-page">
      <Header handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
      <StickyProgressBar rows={allRows} subLevel={selectedSubLevel} />
      <CustomUserInput
        setText={setText}
        text={text}
        allRows={allRows}
        setAllRows={setAllRows}
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
        <FormProvider {...methods}>
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
        </FormProvider>
      )}
    </Container>
  );
};

export default TranslationPracticeView;

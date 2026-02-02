import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { settingsActions } from "../../../store/settings-slice";
import { Row } from "../../../types";
import TranslationPracticeView from "../view/TranslationPracticeView";

interface TranslationPracticeContainerProps {
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
  // Session Data passed from parent
  allRows: Row[];
  currentBatchIndex: number;
  rows: Row[];
  setAllRows: (rows: Row[]) => void;
  setCurrentBatchIndex: (index: number) => void;
}

const TranslationPracticeContainer: React.FC<TranslationPracticeContainerProps> = (props) => {
  const dispatch = useDispatch();

  // Redux Selectors
  // Session data is now passed via props from AppRoutes -> useTranslationSession
  const { chatUi } = useSelector((state: RootState) => state.settings.settings);

  // Actions
  const setChatUi = (val: boolean) => dispatch(settingsActions.setChatUi(val));

  return <TranslationPracticeView {...props} chatUi={chatUi} setChatUi={setChatUi} />;
};

export default TranslationPracticeContainer;

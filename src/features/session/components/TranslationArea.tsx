import { faSpinner, faPaperPlane, faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { TableCell, InputWrapper, FeedBackTableCell, FeedbackSpan, Button } from "../../../helpers/style";
import { Row } from "../../../types";
import { focusNextInput } from "../../../helpers/utils";
import Tooltip from "../../../components/design-system/Tooltip";
import InputSwitcher from "./InputSwitcher";
import { sessionActions } from "../../../store/session-slice";

interface TranslationAreaProps {
  idx: number;
  row: Row;
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>;
  handleTranslate: (index: number, event: HTMLInputElement | undefined, value: string) => Promise<void>;
  handleAiCheck: (index: number, event: HTMLInputElement | undefined) => Promise<void>;
  useGapFill: boolean;
  shiftButtonDown: boolean;
}
const TranslationArea: React.FC<TranslationAreaProps> = ({
  idx,
  row,
  inputRefs,
  handleTranslate,
  handleAiCheck,
  useGapFill,
  shiftButtonDown,
}) => {
  const dispatch = useDispatch();
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);
  const [hasFocus, setHasFocus] = useState<boolean>(false);

  // LOCAL STATE - Fixes performance
  const [localInput, setLocalInput] = useState(row.userInput || "");
  const [lastEdited, setLastEdited] = useState<HTMLInputElement | undefined>();

  // Sync local state if parent changes (e.g. from retry or reset)
  useEffect(() => {
    setLocalInput(row.userInput);
  }, [row.userInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value);
  };

  const commitInput = () => {
    if (localInput !== row.userInput) {
      dispatch(sessionActions.updateRowInput({ id: row.id, userInput: localInput }));
    }
  };

  const handleBlur = () => {
    commitInput();

    // Delay before setting hasFocus to false
    blurTimeout.current = setTimeout(() => {
      setHasFocus(false);
    }, 10); // adjust delay as needed
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    setLastEdited(e.target as HTMLInputElement);
    if (e.key === "Enter") {
      e.preventDefault();
      // Ensure parent has latest value before translating
      commitInput();
      handleTranslate(index, e.target as HTMLInputElement, localInput);
    }
  };

  // Trigger focus next using the Ref Map
  const triggerNextWrapper = (currentInput: HTMLInputElement | undefined, back: boolean = false) => {
    focusNextInput(currentInput, inputRefs.current, idx, back);
  };

  const shouldShowCheck = (row: Row) => {
    return row.isCorrect === undefined || row.isCorrect === true;
  };

  const handleFocus = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current); // cancel pending blur
      blurTimeout.current = null;
    }
    setHasFocus(true);
  };

  const getTimerDuration = useCallback((sentence: string) => {
    const words = sentence.trim().split(/\s+/).filter(Boolean).length;
    return 2 + 0.5 * words;
  }, []);

  useEffect(() => {
    // Focus first input on mount if it exists
    if (idx === 0) {
      const el = inputRefs.current.get(0);
      el?.focus();
    }
  }, [idx, row.sentence, inputRefs]);

  useEffect(() => {
    if (hasFocus === true && row.isLoading) {
      setHasFocus(false);
    }
  }, [row.isLoading, hasFocus, setHasFocus]);

  // Callback ref to register with the Map
  const setRef = (el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(idx, el);
    else inputRefs.current.delete(idx);
  };

  return (
    <div
      className="translation-area"
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="region"
      aria-label={`Translation row ${idx + 1}`}
    >
      <TableCell style={{ justifyContent: "space-between" }}>
        <span>{idx + 1}. </span>
        <span style={{ width: "-webkit-fill-available", color: "rgb(159 179 200)" }} aria-label="Sentence to translate">
          {row.sentence}
        </span>
      </TableCell>
      <TableCell key={`${idx}-input`} className="input-cell">
        <InputWrapper>
          <InputSwitcher
            useGapFill={useGapFill}
            row={row}
            userInput={localInput}
            onChange={handleChange}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, idx)}
            triggerNext={triggerNextWrapper}
            setLastEdited={setLastEdited}
            shiftButtonDown={shiftButtonDown}
            inputRef={setRef}
          />
        </InputWrapper>
      </TableCell>
      <FeedBackTableCell key={`feedbackTableCell-${idx}`}>
        <div className="feedbackWrapper" aria-live="polite">
          {row.feedback &&
            row.feedback.map((fb: any, i: number) => (
              <span key={`wrap${idx}-${i}`}>
                <FeedbackSpan key={i} $correct={fb.correct}>
                  {fb.word}
                </FeedbackSpan>{" "}
              </span>
            ))}
        </div>
        <div>
          {shouldShowCheck(row) ? (
            <Tooltip text="Submit your answer and check for errors">
              <Button
                onClick={() => {
                  commitInput();
                  handleTranslate(idx, lastEdited, localInput);
                }}
                disabled={row.isLoading || !localInput}
                className={hasFocus && !row.isCorrect ? "timer-btn animate" : ""}
                style={{ "--duration": `${getTimerDuration(row.sentence)}s` } as React.CSSProperties}
                aria-label="Check Translation"
              >
                <FontAwesomeIcon
                  className={row.isLoading || !localInput ? "checkButtonDisabled" : "checkButtonEnabled"}
                  icon={row.isLoading ? faSpinner : faPaperPlane}
                  spin={row.isLoading}
                />
              </Button>
            </Tooltip>
          ) : (
            <Tooltip text="Get AI feedback on your translation for more nuance">
              <Button
                className={hasFocus ? "timer-btn animate" : ""}
                onClick={() => handleAiCheck(idx, lastEdited)}
                disabled={row.isLoading || row.isCorrect === undefined || !localInput}
                style={
                  {
                    color: row.aiCorrect === false ? "rgba(236, 80, 80, 1)" : "gray",
                    "--duration": `${getTimerDuration(row.sentence)}s`,
                  } as React.CSSProperties
                }
                aria-label="Check AI Feedback"
              >
                <FontAwesomeIcon icon={row.isLoading ? faSpinner : faBrain} spin={row.isLoading} />{" "}
              </Button>
            </Tooltip>
          )}
        </div>
      </FeedBackTableCell>
    </div>
  );
};

export default React.memo(TranslationArea);

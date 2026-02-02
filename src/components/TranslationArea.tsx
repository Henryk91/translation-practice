import { faSpinner, faPaperPlane, faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useCallback, useEffect } from "react";
import { TableCell, InputWrapper, FeedBackTableCell, FeedbackSpan, Button } from "../helpers/style";
import { Row } from "../types";
import { focusNextInput } from "../helpers/utils";
import Tooltip from "./Tooltip";
import InputSwitcher from "./InputSwitcher";

interface TranslationAreaProps {
  idx: number;
  row: Row;
  // New: Pass the map to allow self-lookup
  inputRefs: React.MutableRefObject<Map<number, HTMLInputElement>>;
  handleTranslate: (index: number, event: HTMLInputElement | undefined, value: string) => Promise<void>;
  handleAiCheck: (index: number, event: HTMLInputElement | undefined) => Promise<void>;
  // New: Only update parent when necessary
  updateRowInput: (index: number, value: string) => void;
  useGapFill: boolean;
  shiftButtonDown: boolean;
}
const TranslationArea: React.FC<TranslationAreaProps> = ({
  idx,
  row,
  inputRefs,
  handleTranslate,
  handleAiCheck,
  updateRowInput,
  useGapFill,
  shiftButtonDown,
}) => {
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

  const handleBlur = () => {
    // Commit to parent on blur if changed
    if (localInput !== row.userInput) {
      updateRowInput(idx, localInput);
    }

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
      updateRowInput(idx, localInput);
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
    <div className="translation-area" onFocus={handleFocus} onBlur={handleBlur}>
      <TableCell style={{ justifyContent: "space-between" }}>
        <span>{idx + 1}. </span>
        <span style={{ width: "-webkit-fill-available", color: "rgb(159 179 200)" }}>{row.sentence}</span>
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
        <div className="feedbackWrapper">
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
                  updateRowInput(idx, localInput);
                  handleTranslate(idx, lastEdited, localInput);
                }}
                disabled={row.isLoading || !localInput}
                className={hasFocus && !row.isCorrect ? "timer-btn animate" : ""}
                style={{ "--duration": `${getTimerDuration(row.sentence)}s` } as React.CSSProperties}
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

export default TranslationArea;

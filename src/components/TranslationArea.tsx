import { faSpinner, faPaperPlane, faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useCallback, useEffect } from "react";
import { TableCell, InputWrapper, FeedBackTableCell, FeedbackSpan, Button } from "../helpers/style";
import { Row } from "../helpers/types";
import { focusNextInput } from "../helpers/utils";
import InputSwitcher from "./InputSwitcher";

interface TranslationAreaProps {
  idx: number;
  row: Row;
  inputRef: HTMLInputElement | null;
  handleTranslate: (index: number, event: HTMLInputElement | undefined) => Promise<void>;
  handleAiCheck: (index: number, event: HTMLInputElement | undefined) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  useGapFill: boolean;
  shiftButtonDown: boolean;
}
const TranslationArea: React.FC<TranslationAreaProps> = ({
  idx,
  row,
  inputRef,
  handleTranslate,
  handleAiCheck,
  handleInputChange,
  useGapFill,
  shiftButtonDown,
}) => {
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<HTMLInputElement | undefined>();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
    setLastEdited(e.target as HTMLInputElement);
    if (e.key === "Enter") {
      e.preventDefault();
      handleTranslate(index, e.target as HTMLInputElement);
    }
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

  const handleBlur = () => {
    // Delay before setting hasFocus to false
    blurTimeout.current = setTimeout(() => {
      setHasFocus(false);
    }, 10); // adjust delay as needed
  };

  const getTimerDuration = useCallback((sentence: string) => {
    const words = sentence.trim().split(/\s+/).filter(Boolean).length;
    return 2 + 0.5 * words;
  }, []);

  useEffect(() => {
    if (idx === 0) inputRef?.focus();
  }, [idx, row.sentence, inputRef]);

  useEffect(() => {
    if (hasFocus === true && row.isLoading) {
      setHasFocus(false);
    }
  }, [row.isLoading, hasFocus, setHasFocus]);

  return (
    <div className="translation-area" onFocus={handleFocus} onBlur={handleBlur}>
      <TableCell style={{ justifyContent: "space-between" }}>
        <span>{idx + 1}. </span>
        <span style={{ width: "-webkit-fill-available" }}>{row.sentence}</span>
      </TableCell>
      <TableCell key={`${idx}-input`} className="input-cell">
        <InputWrapper>
          <InputSwitcher
            useGapFill={useGapFill}
            row={row}
            userInput={row.userInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, idx)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, idx)}
            triggerNext={focusNextInput}
            setLastEdited={setLastEdited}
            shiftButtonDown={shiftButtonDown}
            inputRef={(el: HTMLInputElement | null) => (inputRef = el)}
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
            <Button
              onClick={() => handleTranslate(idx, lastEdited)}
              disabled={row.isLoading || !row.userInput}
              className={hasFocus && !row.isCorrect ? "timer-btn animate" : ""}
              style={{ "--duration": `${getTimerDuration(row.sentence)}s` } as React.CSSProperties}
            >
              <FontAwesomeIcon
                className={row.isLoading || !row.userInput ? "checkButtonDisabled" : "checkButtonEnabled"}
                icon={row.isLoading ? faSpinner : faPaperPlane}
                spin={row.isLoading}
              />
            </Button>
          ) : (
            <Button
              className={hasFocus ? "timer-btn animate" : ""}
              onClick={() => handleAiCheck(idx, lastEdited)}
              disabled={row.isLoading || row.isCorrect === undefined || !row.userInput}
              style={
                {
                  color: row.aiCorrect === false ? "red" : "gray",
                  "--duration": `${getTimerDuration(row.sentence)}s`,
                } as React.CSSProperties
              }
            >
              <FontAwesomeIcon icon={row.isLoading ? faSpinner : faBrain} spin={row.isLoading} />{" "}
            </Button>
          )}
        </div>
      </FeedBackTableCell>
    </div>
  );
};

export default TranslationArea;

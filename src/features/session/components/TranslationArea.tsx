import { faSpinner, faPaperPlane, faBrain } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
// import { useDispatch } from "react-redux"; // Removed as we no longer dispatch inputs
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { TableCell, InputWrapper, FeedBackTableCell, FeedbackSpan, Button } from "../../../helpers/style";
import { Row } from "../../../types";
import { focusNextInput } from "../../../helpers/utils";
import Tooltip from "../../../components/design-system/Tooltip";
import InputSwitcher from "./InputSwitcher";
// import { sessionActions } from "../../../store/session-slice"; // Removed as we no longer dispatch inputs

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
  // Use React Hook Form context
  const { control } = useFormContext();
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<HTMLInputElement | undefined>();
  const timerSpeed = useSelector((state: RootState) => state.settings.settings.timerSpeed ?? 1);

  const handleBlur = () => {
    // No need to dispatch/commit to Redux on blur anymore as form state handles it locally
    // Delay before setting hasFocus to false
    blurTimeout.current = setTimeout(() => {
      setHasFocus(false);
    }, 10);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    onChange: (...event: any[]) => void,
    value: string,
  ): void => {
    setLastEdited(e.target as HTMLInputElement);
    if (e.key === "Enter") {
      e.preventDefault();
      // Ensure RHF has the latest value if needed (though onChange handles it)
      // Pass the current value to handleTranslate
      handleTranslate(index, e.target as HTMLInputElement, value);
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

  const getTimerDuration = useCallback(
    (sentence: string) => {
      const words = sentence.trim().split(/\s+/).filter(Boolean).length;
      let baseDuration = 2 + 0.5 * words;
      return timerSpeed > 0 ? baseDuration / timerSpeed : baseDuration;
    },
    [timerSpeed],
  );

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
          <Controller
            control={control}
            name={`translations.${idx}.userInput`}
            render={({ field: { onChange, value } }) => (
              <InputSwitcher
                useGapFill={useGapFill}
                row={row}
                userInput={value || ""}
                onChange={onChange}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, idx, onChange, value)}
                triggerNext={triggerNextWrapper}
                setLastEdited={setLastEdited}
                shiftButtonDown={shiftButtonDown}
                inputRef={setRef}
              />
            )}
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
              {/* We need to get the current value for the button onClick too */}
              <Controller
                control={control}
                name={`translations.${idx}.userInput`}
                render={({ field: { value } }) => (
                  <Button
                    onClick={() => {
                      handleTranslate(idx, lastEdited, value || "");
                    }}
                    disabled={row.isLoading || !value}
                    className={hasFocus && !row.isCorrect && timerSpeed > 0 ? "timer-btn animate" : ""}
                    style={{ "--duration": `${getTimerDuration(row.sentence)}s` } as React.CSSProperties}
                    aria-label="Check Translation"
                  >
                    <FontAwesomeIcon
                      className={row.isLoading || !value ? "checkButtonDisabled" : "checkButtonEnabled"}
                      icon={row.isLoading ? faSpinner : faPaperPlane}
                      spin={row.isLoading}
                    />
                  </Button>
                )}
              />
            </Tooltip>
          ) : (
            <Tooltip text="Get AI feedback on your translation for more nuance">
              <Button
                className={hasFocus && timerSpeed > 0 ? "timer-btn animate" : ""}
                onClick={() => handleAiCheck(idx, lastEdited)}
                // Check value disabled state? row.userInput is from Redux, might be stale if we removed sync?
                // We should use RHF value check.
                // But row.isCorrect logic depends on row.
                disabled={row.isLoading || row.isCorrect === undefined} // Should also check !value?
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

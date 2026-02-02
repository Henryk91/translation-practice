import React, { useEffect, useState } from "react";
import GapFillInput from "./GapFillInput";
import { TextInput } from "../helpers/style";
import { Row } from "../types";
interface InputSwitcherProps {
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  triggerNext: (e: HTMLInputElement | undefined, back?: boolean) => void;
  setLastEdited: (e: HTMLInputElement) => void;
  shiftButtonDown: boolean;
  inputRef?: (el: HTMLInputElement | null) => void;
  useGapFill: boolean;
  row: Row;
}

const InputSwitcher: React.FC<InputSwitcherProps> = ({
  useGapFill,
  row,
  userInput,
  onChange,
  onKeyPress,
  triggerNext,
  setLastEdited,
  inputRef,
  shiftButtonDown,
}) => {
  const gapMatches = row?.gapTranslation?.match(/\{.*?\}/g) || [];
  const gapCount = !useGapFill ? 1 : gapMatches.length;
  const hasGaps = gapCount > 0;

  const getInitialInputs = React.useCallback(
    (val: string): string[] => {
      if (!val) return Array(gapCount).fill("");

      // 1. Try to extract from {gap} format
      const gapRegex = /\{(.*?)\}/g;
      const matches = val.match(gapRegex);
      if (matches && matches.length === gapCount) {
        return matches.map((m) => m.slice(1, -1));
      }

      // 2. Try to re-gap from full sentence (useful when coming from Chat mode)
      if (row.gapTranslation) {
        // Escape regex special chars in static parts
        const escapedTemplate = row.gapTranslation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Replace escaped gaps with capture groups
        const matchRegexStr = "^" + escapedTemplate.replace(/\\\{.*?\\\}/g, "(.*?)") + "$";
        try {
          const matchRegex = new RegExp(matchRegexStr, "i");
          const match = val.match(matchRegex);
          if (match) {
            return match.slice(1);
          }
        } catch (e) {
          console.error("Regex error in re-gap:", e);
        }

        // 3. Fallback: If marked correct but extraction failed (e.g. Chat mode punctuation diffs), use canonical answers
        if (row.isCorrect || row.aiCorrect) {
          const canonicalMatches = row.gapTranslation.match(gapRegex);
          if (canonicalMatches && canonicalMatches.length === gapCount) {
            return canonicalMatches.map((m) => m.slice(1, -1));
          }
        }
      }

      return Array(gapCount).fill("");
    },
    [gapCount, row.gapTranslation, row.aiCorrect, row.isCorrect],
  );

  const [inputs, setInputs] = useState<string[]>(() => getInitialInputs(userInput));

  useEffect(() => {
    setInputs(getInitialInputs(userInput));
  }, [userInput, getInitialInputs]);

  const handleInternalChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = [...inputs];
    updated[index] = e.target.value;
    setInputs(updated);

    let newSentence = row.gapTranslation;
    gapMatches.forEach((match, i) => {
      newSentence = newSentence?.replace(match, `{-${updated[i].trim()}-}`);
    });
    newSentence = newSentence?.replaceAll("{-", "{")?.replaceAll("-}", "}");
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: newSentence,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  const gapRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const keyPressWrapper = (e: React.KeyboardEvent<HTMLInputElement>, index?: number) => {
    if (e.key === "Enter" && shiftButtonDown) {
      e.preventDefault();
      triggerNext(e.target as HTMLInputElement, true);
      return;
    }

    if (e.currentTarget.value.trim() === "" && e.key !== "Enter") {
      setLastEdited(e.target as HTMLInputElement);
      return;
    }

    if (e.key !== "Enter") {
      return;
    }

    // Process "Enter"
    if (gapCount === 1) {
      onKeyPress(e);
      return;
    }

    // Multiple Gaps
    if (index !== undefined && index < gapCount - 1) {
      // Focus next gap internally
      e.preventDefault();
      gapRefs.current[index + 1]?.focus();
    } else {
      // Last gap or index undefined: attempt to submit
      const currentAmount = [...inputs].filter((input) => input.trim() !== "").length;
      if (currentAmount === gapCount) {
        onKeyPress(e);
      } else {
        // Find next empty gap
        const nextEmptyIndex = inputs.findIndex((val, i) => i > (index ?? -1) && val.trim() === "");
        if (nextEmptyIndex !== -1) {
          e.preventDefault();
          gapRefs.current[nextEmptyIndex]?.focus();
        } else {
          // All gaps filled but onEnter logic (trigger next sentence/submit)
          onKeyPress(e);
        }
      }
    }
  };

  const setGapRef = (index: number) => (el: HTMLInputElement | null) => {
    gapRefs.current[index] = el;
    if (index === 0 && inputRef) {
      inputRef(el);
    }
  };

  if (!useGapFill || !hasGaps) {
    const value = userInput.includes("{") ? userInput.replaceAll("{", "").replaceAll("}", "") : userInput;
    return (
      <TextInput
        className="practice-input"
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyUp={(e) => keyPressWrapper(e)}
        aria-label="Translate sentence"
      />
    );
  }

  return (
    <GapFillInput
      template={row.gapTranslation || ""}
      userInputs={inputs}
      onChange={handleInternalChange}
      onKeyPress={keyPressWrapper}
      inputRefs={Array.from({ length: gapCount }, (_, i) => setGapRef(i))}
    />
  );
};

export default InputSwitcher;

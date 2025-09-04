import React, { useEffect, useState } from "react";
import GapFillInput from "./GapFillInput";
import { TextInput } from "../helpers/style";
import { Row } from "../helpers/types";
interface InputSwitcherProps {
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  triggerNext: (e: HTMLInputElement, back?: Boolean) => void;
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

  const [inputs, setInputs] = useState<string[]>(() =>
    userInput.split(" ").slice(0, gapCount).concat(Array(gapCount).fill("")).slice(0, gapCount)
  );

  useEffect(() => {
    if (userInput === "") {
      setInputs(Array(gapCount).fill(""));
    }
  }, [userInput, gapCount]);

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

  const keyPressWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && shiftButtonDown) {
      e.preventDefault();
      triggerNext(e.target as HTMLInputElement, true);
      return;
    }

    if (e.currentTarget.value.trim() === "") {
      setLastEdited(e.target as HTMLInputElement);
      return;
    }
    if (e.key !== "Enter" || gapCount === 1) {
      onKeyPress(e);
      return;
    }

    const currentAmount = [...inputs].filter((input) => input.trim() !== "").length;

    if (currentAmount === gapCount) {
      onKeyPress(e);
      return;
    }

    if (currentAmount === 0) return;

    e.preventDefault();
    setLastEdited(e.target as HTMLInputElement);
    triggerNext(e.target as HTMLInputElement);
  };

  if (!useGapFill || !hasGaps) {
    const value = userInput.includes("{") ? userInput.replaceAll("{", "").replaceAll("}", "") : userInput;
    return <TextInput ref={inputRef} value={value} onChange={onChange} onKeyUp={keyPressWrapper} />;
  }

  return (
    <GapFillInput
      template={row.gapTranslation || ""}
      userInputs={inputs}
      onChange={handleInternalChange}
      onKeyPress={keyPressWrapper}
      inputRefs={Array.from({ length: gapCount }, (_, i) => (i === 0 && inputRef ? inputRef : () => {}))}
    />
  );
};

export default InputSwitcher;

import React, { useEffect, useState } from "react";
import GapFillInput from "./GapFillInput";
import { TextInput } from "./style";
interface InputSwitcherProps {
  template: string;
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  triggerNext: (e: HTMLInputElement, back?: Boolean) => void;
  setLastEdited: (e: HTMLInputElement) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const InputSwitcher: React.FC<InputSwitcherProps> = ({
  template,
  userInput,
  onChange,
  onKeyPress,
  triggerNext,
  setLastEdited,
  inputRef,
}) => {
  const gapMatches = template.match(/\{.*?\}/g) || [];
  const gapCount = gapMatches.length;
  const hasGaps = gapCount > 0;

  const [inputs, setInputs] = useState<string[]>(() =>
    userInput.split(" ").slice(0, gapCount).concat(Array(gapCount).fill("")).slice(0, gapCount)
  );

  const [shiftButtonDown, setShiftButtonDown] = useState<boolean>(false);

  useEffect(() => {
    if (userInput === "") {
      setInputs(Array(gapCount).fill(""));
    }
  }, [userInput, gapCount]);

  const handleInternalChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = [...inputs];
    updated[index] = e.target.value;
    setInputs(updated);

    let newSentence = template;
    gapMatches.forEach((match, i) => {
      newSentence = newSentence.replace(match, `{${updated[i].trim()}}` || "");
    });
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
    if (e.key === "Shift") {
      setShiftButtonDown(false);
      return;
    }

    if (e.key === "Enter" && shiftButtonDown) {
      e.preventDefault();
      setShiftButtonDown(false);
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Shift") {
      setShiftButtonDown(true);
    }
  };

  if (!hasGaps) {
    return (
      <TextInput ref={inputRef} value={userInput} onChange={onChange} onKeyUp={keyPressWrapper} onKeyDown={onKeyDown} />
    );
  }

  return (
    <GapFillInput
      template={template}
      userInputs={inputs}
      onChange={handleInternalChange}
      onKeyPress={keyPressWrapper}
      onKeyDown={onKeyDown}
      inputRefs={Array.from({ length: gapCount }, (_, i) => (i === 0 && inputRef ? inputRef : () => {}))}
    />
  );
};

export default InputSwitcher;

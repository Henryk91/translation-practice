import React, { useEffect, useState } from "react";
import GapFillInput from "./GapFillInput";
import { TextInput } from "./style";
interface InputSwitcherProps {
  template: string;
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const InputSwitcher: React.FC<InputSwitcherProps> = ({ template, userInput, onChange, onKeyPress, inputRef }) => {
  const gapMatches = template.match(/\{.*?\}/g) || [];
  const gapCount = gapMatches.length;
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

    let newSentence = template;
    gapMatches.forEach((match, i) => {
      newSentence = newSentence.replace(match, updated[i] || "");
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

  if (!hasGaps) {
    return <TextInput ref={inputRef} value={userInput} onChange={onChange} onKeyPress={onKeyPress} />;
  }

  return (
    <GapFillInput
      template={template}
      userInputs={inputs}
      onChange={handleInternalChange}
      onKeyPress={onKeyPress}
      inputRefs={Array.from({ length: gapCount }, (_, i) => (i === 0 && inputRef ? inputRef : () => {}))}
    />
  );
};

export default InputSwitcher;

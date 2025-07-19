import React from "react";
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
  const hasGap = template.includes("{") && template.includes("}");

  return hasGap ? (
    <GapFillInput
      template={template}
      userInput={userInput}
      onChange={onChange}
      onKeyPress={onKeyPress}
      inputRef={inputRef}
    />
  ) : (
    <TextInput ref={inputRef} value={userInput} onChange={onChange} onKeyPress={onKeyPress} />
  );
};

export default InputSwitcher;

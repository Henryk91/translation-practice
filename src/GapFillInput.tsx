import React from "react";
import { TextInput } from "./style";

interface GapFillInputProps {
  template: string;
  userInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const GapFillInput: React.FC<GapFillInputProps> = ({ template, userInput, onChange, onKeyPress, inputRef }) => {
  const match = template.match(/\{(.+?)\}/);
  if (!match) return <>{template}</>;
  const before = template.split(match[0])[0];
  const after = template.split(match[0])[1];
  return (
    <span>
      {before}
      <TextInput
        ref={inputRef}
        value={userInput}
        onChange={onChange}
        onKeyPress={onKeyPress}
        style={{ width: `${match[1].length + 1}ch`, padding: "1px 8px", marginRight: "1px", textAlign: "center" }}
      />
      {after}
    </span>
  );
};

export default GapFillInput;

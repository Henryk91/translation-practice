import React from "react";
import { TextInput } from "../style";

interface GapFillInputProps {
  template: string;
  userInputs: string[];
  onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRefs?: ((el: HTMLInputElement | null) => void)[];
}

const GapFillInput: React.FC<GapFillInputProps> = ({
  template,
  userInputs,
  onChange,
  onKeyPress,
  onKeyDown,
  inputRefs = [],
}) => {
  const parts: React.ReactNode[] = [];
  const regex = /\{(.*?)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let inputIndex = 0;

  while ((match = regex.exec(template)) !== null) {
    const beforeText = template.slice(lastIndex, match.index);
    parts.push(<span key={`text-${inputIndex}`}>{beforeText}</span>);
    const currentIndex = inputIndex;

    const width = `${(match[1]?.length || 4) + 1}ch`;
    parts.push(
      <TextInput
        key={`input-${currentIndex}`}
        ref={inputRefs[currentIndex]}
        value={userInputs[currentIndex] || ""}
        onChange={(e: any) => onChange(currentIndex, e)}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        style={{
          width,
          padding: "1px 8px",
          marginRight: "1px",
          textAlign: "center",
          fontSize: "1.0em",
        }}
      />
    );

    lastIndex = regex.lastIndex;
    inputIndex++;
  }

  // Add any remaining static text after the last match
  if (lastIndex < template.length) {
    parts.push(<span key="text-end">{template.slice(lastIndex)}</span>);
  }

  return <span style={{ width: "100%" }}>{parts}</span>;
};

export default GapFillInput;

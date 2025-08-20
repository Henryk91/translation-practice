import React, { useState } from "react";
import { MenuButton, TextArea, TextAreaButtonWrapper, TextAreaWrapper } from "../helpers/style";
import { Row } from "../helpers/types";
import { faSyncAlt, faPaperPlane, faTrash, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { splitAndShuffle, splitSentences } from "../helpers/utils";
import { Dict } from "styled-components/dist/types";
import { translateSentence } from "../helpers/requests";

interface CustomUserInputProps {
  selectedLevel: string | undefined;
  setText: (text: string) => void;
  text: string;
  setRows: (value: React.SetStateAction<Row[]>) => void;
  rows: any[];
  levelSentences: Dict;
}

const CustomUserInput: React.FC<CustomUserInputProps> = ({
  selectedLevel,
  setText,
  text,
  setRows,
  rows,
  levelSentences,
}) => {
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const handleTextSubmit = (): void => {
    let textToSplit = text;
    if (!text && selectedLevel) {
      textToSplit = levelSentences[selectedLevel] as string;
      setText(textToSplit);
    }
    const sentences = selectedLevel === "Own Sentences" ? splitSentences(textToSplit) : splitAndShuffle(textToSplit);
    setRows(sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null })));
  };

  const initTranslatedSentences = async () => {
    setLoadingTranslation(true);
    const originalSentences = rows.map((row) => row.sentence).join(" ");
    const response = await translateSentence(originalSentences);
    const translatedSentences = splitSentences(response);
    const updated = rows.map((row, i) => {
      row.translation = translatedSentences[i];
      return row;
    });

    setRows(updated);
    setLoadingTranslation(false);
  };

  const handleTextClear = (): void => {
    setText("");
  };

  if (selectedLevel !== "Own Sentences") return <></>;
  return (
    <TextAreaWrapper>
      {selectedLevel === "Own Sentences" && (
        <TextArea
          placeholder="Enter English sentences here (make sure they end on a full stop or question mark) then click the paper plane to create the translation rows."
          value={text}
          onChange={(e: any) => setText(e.target.value)}
        />
      )}

      <TextAreaButtonWrapper>
        {selectedLevel === "Own Sentences" && (
          <>
            <MenuButton onClick={handleTextSubmit}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </MenuButton>
            <MenuButton onClick={handleTextClear}>
              <FontAwesomeIcon icon={faTrash} />
            </MenuButton>
            <MenuButton onClick={initTranslatedSentences} disabled={loadingTranslation || rows.length === 0}>
              <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "5px" }} />
              <FontAwesomeIcon icon={faSyncAlt} spin={loadingTranslation} />
            </MenuButton>
          </>
        )}
      </TextAreaButtonWrapper>
    </TextAreaWrapper>
  );
};

export default CustomUserInput;

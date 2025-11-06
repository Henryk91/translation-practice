import React, { useState } from "react";
import { MenuButton, TextArea, TextAreaButtonWrapper, TextAreaWrapper } from "../helpers/style";
import { Row } from "../helpers/types";
import { faSyncAlt, faPaperPlane, faTrash, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { splitAndShuffle, splitSentences } from "../helpers/utils";
import { translateSentence } from "../helpers/requests";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface CustomUserInputProps {
  setText: (text: string) => void;
  text: string;
  setRows: (value: React.SetStateAction<Row[]>) => void;
  rows: any[];
}

const CustomUserInput: React.FC<CustomUserInputProps> = ({ setText, text, setRows, rows }) => {
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const levelSentences = useSelector((state: RootState) => state.ui.levelSentences);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const generateSentences = () => {
    let textToSplit = text;
    if (!text && selectedLevel) {
      textToSplit = levelSentences[selectedLevel] as string;
      setText(textToSplit);
    }
    const sentences = selectedLevel === "Own Sentences" ? splitSentences(textToSplit) : splitAndShuffle(textToSplit);
    return sentences.map((sentence) => ({ sentence, userInput: "", translation: "", feedback: null }));
  };

  const handleTextSubmit = (): void => {
    const sentences = generateSentences();
    setRows(sentences);
  };

  const initTranslatedSentences = async () => {
    setLoadingTranslation(true);
    const sentences = !rows?.length ? generateSentences() : rows;
    const originalSentences = sentences.map((row) => row.sentence).join(" ");
    const response = await translateSentence(originalSentences);
    const translatedSentences = splitSentences(response);
    const updated = sentences.map((row, i) => {
      row.translation = translatedSentences[i];
      return row;
    });
    setRows(updated);
    setLoadingTranslation(false);
  };

  const handleTextClear = (): void => {
    setText("");
    setRows([]);
  };

  if (selectedLevel !== "Own Sentences") return <></>;
  return (
    <TextAreaWrapper>
      {selectedLevel === "Own Sentences" && !rows.length && (
        <TextArea
          placeholder="Enter English sentences here (make sure they end on a full stop or question mark) then click the paper plane to create the translation rows."
          value={text}
          onChange={(e: any) => setText(e.target.value)}
        />
      )}

      <TextAreaButtonWrapper>
        {selectedLevel === "Own Sentences" && (
          <>
            {rows.length ? (
              <MenuButton onClick={handleTextClear}>
                <FontAwesomeIcon icon={faTrash} />
              </MenuButton>
            ) : (
              <MenuButton onClick={handleTextSubmit}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </MenuButton>
            )}

            <MenuButton onClick={initTranslatedSentences} disabled={loadingTranslation || text === ""}>
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

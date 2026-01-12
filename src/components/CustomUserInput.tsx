import React, { useState } from "react";
import { MenuButton, TextArea, TextAreaButtonWrapper, TextAreaWrapper } from "../helpers/style";
import Tooltip from "./Tooltip";
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
  setAllRows: (value: React.SetStateAction<Row[]>) => void;
  rows: Row[];
  setCurrentBatchIndex: (index: number) => void;
}

const CustomUserInput: React.FC<CustomUserInputProps> = ({ setText, text, setAllRows, rows, setCurrentBatchIndex }) => {
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
    return sentences.map((sentence, idx) => ({
      sentence,
      userInput: "",
      translation: "",
      feedback: null,
      id: `custom-${idx}-${Date.now()}`,
      batchId: Math.floor(idx / 10), // Using 10 as BATCH_SIZE
    }));
  };

  const handleTextSubmit = (): void => {
    const sentences = generateSentences();
    setAllRows(sentences);
    setCurrentBatchIndex(0);
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
    setAllRows(updated);
    setLoadingTranslation(false);
  };

  const handleTextClear = (): void => {
    setText("");
    setAllRows([]);
    setCurrentBatchIndex(0);
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
              <Tooltip text="Clear your current sentences and start over">
                <MenuButton onClick={handleTextClear}>
                  <FontAwesomeIcon icon={faTrash} />
                </MenuButton>
              </Tooltip>
            ) : (
              <Tooltip text="Process these sentences and start the exercise">
                <MenuButton onClick={handleTextSubmit}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </MenuButton>
              </Tooltip>
            )}

            <Tooltip text="Automatically translate these sentences into German using AI">
              <MenuButton onClick={initTranslatedSentences} disabled={loadingTranslation || text === ""}>
                <FontAwesomeIcon icon={faLanguage} style={{ marginRight: "5px" }} />
                <FontAwesomeIcon icon={faSyncAlt} spin={loadingTranslation} />
              </MenuButton>
            </Tooltip>
          </>
        )}
      </TextAreaButtonWrapper>
    </TextAreaWrapper>
  );
};

export default CustomUserInput;

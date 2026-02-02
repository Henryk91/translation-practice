import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MenuButton, TextArea, TextAreaButtonWrapper, TextAreaWrapper } from "../../../helpers/style";
import Tooltip from "../../../components/design-system/Tooltip";
import { Row } from "../../../types";
import { faSyncAlt, faPaperPlane, faTrash, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { splitAndShuffle, splitSentences } from "../../../helpers/utils";
import { translateSentence } from "../../../helpers/requests";
import { RootState } from "../../../store";
import { sessionActions } from "../../../store/session-slice";

interface CustomUserInputProps {
  setText: (text: string) => void;
  text: string;
}

const CustomUserInput: React.FC<CustomUserInputProps> = ({ setText, text }) => {
  const dispatch = useDispatch();
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const levelSentences = useSelector((state: RootState) => state.ui.levelSentences);
  const { allRows } = useSelector((state: RootState) => state.session);

  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const setAllRows = (rows: Row[]) => dispatch(sessionActions.setAllRows(rows));
  const setCurrentBatchIndex = (index: number) => dispatch(sessionActions.setCurrentBatchIndex(index));

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
    // Use allRows if available, otherwise generate
    const sentences = !allRows?.length ? generateSentences() : allRows;
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
      {selectedLevel === "Own Sentences" && !allRows.length && (
        <TextArea
          aria-label="Enter your own sentences"
          placeholder="Enter English sentences here (make sure they end on a full stop or question mark) then click the paper plane to create the translation rows."
          value={text}
          onChange={(e: any) => setText(e.target.value)}
        />
      )}

      <TextAreaButtonWrapper>
        {selectedLevel === "Own Sentences" && (
          <>
            {allRows.length ? (
              <Tooltip text="Clear your current sentences and start over">
                <MenuButton onClick={handleTextClear} aria-label="Clear sentences">
                  <FontAwesomeIcon icon={faTrash} />
                </MenuButton>
              </Tooltip>
            ) : (
              <Tooltip text="Process these sentences and start the exercise">
                <MenuButton onClick={handleTextSubmit} aria-label="Submit sentences">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </MenuButton>
              </Tooltip>
            )}

            <Tooltip text="Automatically translate these sentences into German using AI">
              <MenuButton
                onClick={initTranslatedSentences}
                disabled={loadingTranslation || text === ""}
                aria-label="Auto-translate sentences"
              >
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

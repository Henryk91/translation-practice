import React, { useState } from "react";
import {
  HeaderStyle,
  Label,
  MenuButton,
  MobileMenu,
  Select,
  TextArea,
  TextAreaButtonWrapper,
  TextAreaWrapper,
  Image,
  TitleSpan,
} from "../style";
import { Level as defaultLevels, Row } from "../types";
import {
  faSyncAlt,
  faSave,
  faEdit,
  faHighlighter,
  faPaperPlane,
  faTrash,
  faLanguage,
  faRedoAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SubLevelOption } from "../subLevel";
import { splitAndShuffle, splitSentences } from "../utils";
import { Dict } from "styled-components/dist/types";
import { translateSentence } from "../helpers/requests";

const RedoThreeIcon: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div style={{ position: "relative", margin: "0 2px 0 2px" }}>
      <FontAwesomeIcon icon={faRedoAlt} style={{ fontSize: "1.2em" }} />
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "0.9rem",
          fontWeight: "bold",
          color: "white",
        }}
      >
        {count}
      </span>
    </div>
  );
};

interface HeaderProps {
  handleLevelChange: (level: defaultLevels) => void;
  handleSubLevelChange: (subLevel: string) => void;
  selectedLevel: string | undefined;
  levels: defaultLevels;
  subLevels: defaultLevels;
  selectedSubLevel: string | undefined;
  mode: string;
  setMode: (mode: "easy" | "hard") => void;
  setText: (text: string) => void;
  text: string;
  setShuffleSentences: (shuffle: boolean) => void;
  shuffleSentences: boolean;
  setShouldSave: (shouldSave: boolean) => void;
  shouldSave: boolean;
  hasGapFill: boolean;
  useGapFill: boolean;
  configUseGapFill: () => void;
  setRows: (value: React.SetStateAction<Row[]>) => void;
  rows: any[];
  levelSentences: Dict;
  redoErrors: boolean;
  setRedoErrors: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  handleLevelChange,
  handleSubLevelChange,
  selectedLevel,
  levels,
  subLevels,
  selectedSubLevel,
  mode,
  setMode,
  setText,
  text,
  setShuffleSentences,
  shuffleSentences,
  setShouldSave,
  shouldSave,
  hasGapFill,
  useGapFill,
  configUseGapFill,
  setRows,
  rows,
  levelSentences,
  redoErrors,
  setRedoErrors,
}) => {
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);

  const eventHandleSubLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value;

    handleSubLevelChange(level);
  };

  const eventHandleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value as defaultLevels;

    handleLevelChange(level);
  };

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
  return (
    <HeaderStyle>
      <label htmlFor="toggle" className="menu-button" style={{ position: "absolute" }}>
        <FontAwesomeIcon icon={faBars} size="lg" />
      </label>
      <h1 style={{ marginBottom: "unset" }}>
        <Image src={process.env.PUBLIC_URL + "/logo192.png"} alt="App Logo" width="70" height="70" /> <br />
        <TitleSpan $correct={false}>Translate</TitleSpan> to <TitleSpan $correct={true}> German </TitleSpan>
      </h1>
      <MobileMenu>
        <Label>Level:</Label>
        <Select value={selectedLevel || "Select your Language Level"} onChange={eventHandleLevelChange}>
          <option disabled>Select your Language Level</option>
          {Object.values(levels as defaultLevels).map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl.toUpperCase()}
            </option>
          ))}
        </Select>
        {subLevels && (
          <>
            <Select value={selectedSubLevel || "Select Sub Level"} onChange={eventHandleSubLevelChange}>
              <option disabled>Select Sub Level</option>
              {Object.values(subLevels as defaultLevels).map((lvl) => (
                <SubLevelOption key={lvl} selectedLevel={selectedLevel} subLevel={lvl} />
              ))}
            </Select>
          </>
        )}
        {selectedLevel !== "Own Sentences" && (
          <>
            <Label>Mode:</Label>
            <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </Select>
          </>
        )}
      </MobileMenu>
      <TextAreaWrapper>
        {selectedLevel === "Own Sentences" && (
          <TextArea
            placeholder="Enter English sentences here (make sure they end on a full stop or question mark) then click the paper plane to create the translation rows."
            value={text}
            onChange={(e: any) => setText(e.target.value)}
          />
        )}

        <TextAreaButtonWrapper>
          {selectedLevel !== "Own Sentences" && (
            <>
              <MenuButton
                onClick={() => setShuffleSentences(!shuffleSentences)}
                style={{ color: shuffleSentences ? "green" : "red" }}
              >
                <FontAwesomeIcon icon={faSyncAlt} />
                <div style={{ fontSize: "12px", color: "white" }}>Shuffle</div>
              </MenuButton>
              <MenuButton onClick={() => setShouldSave(!shouldSave)} style={{ color: shouldSave ? "green" : "red" }}>
                <FontAwesomeIcon icon={faSave} />
                <div style={{ fontSize: "12px", color: "white" }}>Save</div>
              </MenuButton>

              <MenuButton
                disabled={!hasGapFill}
                onClick={() => configUseGapFill()}
                style={{ color: useGapFill && hasGapFill ? "red" : "currentcolor" }}
              >
                <FontAwesomeIcon icon={useGapFill && hasGapFill ? faEdit : faHighlighter} />
                <div style={{ fontSize: "12px", color: "white" }}>Gap Fill</div>
              </MenuButton>

              <MenuButton
                disabled={!hasGapFill}
                onClick={() => setRedoErrors(!redoErrors)}
                style={{ color: redoErrors ? "green" : "red", padding: "1px" }}
              >
                <RedoThreeIcon count={redoErrors ? 3 : 1} />
                <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Error Retry</div>
              </MenuButton>
            </>
          )}

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
    </HeaderStyle>
  );
};

export default Header;

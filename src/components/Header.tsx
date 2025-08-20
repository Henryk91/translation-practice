import React from "react";
import {
  HeaderStyle,
  Label,
  MenuButton,
  MobileMenu,
  Select,
  TextAreaButtonWrapper,
  TextAreaWrapper,
  Image,
  TitleSpan,
} from "../helpers/style";
import { Level as defaultLevels, SelectedLevelType } from "../helpers/types";
import {
  faSyncAlt,
  faSave,
  faEdit,
  faHighlighter,
  faRedoAlt,
  faBars,
  faMicrophoneSlash,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SubLevelOption } from "../helpers/subLevel";
import { focusNextInput } from "../helpers/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

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
  levels: SelectedLevelType;
  subLevels: defaultLevels;
  selectedSubLevel: string | undefined;
  mode: string;
  setMode: (mode: "easy" | "hard") => void;
  setShuffleSentences: (shuffle: boolean) => void;
  shuffleSentences: boolean;
  setShouldSave: (shouldSave: boolean) => void;
  shouldSave: boolean;
  hasGapFill: boolean;
  useGapFill: boolean;
  configUseGapFill: () => void;
  redoErrors: boolean;
  setRedoErrors: (val: boolean) => void;
  setUseMic: (val: boolean) => void;
  useMic: boolean;
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
  setShuffleSentences,
  shuffleSentences,
  setShouldSave,
  shouldSave,
  hasGapFill,
  useGapFill,
  configUseGapFill,
  redoErrors,
  setRedoErrors,
  setUseMic,
  useMic,
}) => {
  const recognition = useSpeechRecognition("de-DE", useMic, setUseMic);
  const seeFeature = localStorage.getItem("userId") === "68988da2b947c4d46023d679";

  const eventHandleSubLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value;

    handleSubLevelChange(level);
  };

  const eventHandleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const level = e.target.value as defaultLevels;

    handleLevelChange(level);
  };

  return (
    <HeaderStyle>
      <div className="image-wrapper">
        <Image src={process.env.PUBLIC_URL + "/logo192.png"} alt="App Logo" />
        <div style={{ display: "flex", flexDirection: "row", width: "fit-content" }}>
          <TitleSpan $correct={false}>Translate</TitleSpan> <span>to</span>{" "}
          <TitleSpan $correct={true}> German </TitleSpan>
        </div>
        <label htmlFor="toggle" className="menu-button">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </label>
      </div>
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
        <TextAreaButtonWrapper>
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
            {seeFeature && (
              <MenuButton
                onClick={() => {
                  if (useMic) {
                    recognition?.current?.stop();
                  } else {
                    focusNextInput(undefined);
                    recognition?.current?.start();
                  }
                  setUseMic(!useMic);
                }}
                style={{ color: useMic ? "green" : "red", padding: "1px" }}
              >
                <FontAwesomeIcon icon={useMic ? faMicrophoneSlash : faMicrophone} />
                <div style={{ fontSize: "12px", color: "white" }}>Use Mic</div>
              </MenuButton>
            )}
          </>
        </TextAreaButtonWrapper>
      </TextAreaWrapper>
    </HeaderStyle>
  );
};

export default Header;

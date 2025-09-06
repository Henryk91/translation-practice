import React from "react";
import { MenuButton, SettingsButtonWrapper, SpeechContainer, TextInput } from "../helpers/style";
import {
  faSyncAlt,
  faSave,
  faEdit,
  faHighlighter,
  faRedoAlt,
  faMicrophoneSlash,
  faMicrophone,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { focusNextInput } from "../helpers/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface SettingsRowProps {
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

export const SettingsRow: React.FC<SettingsRowProps> = ({
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
  return (
    <SettingsButtonWrapper>
      {useMic && (
        <SpeechContainer>
          <TextInput id="interim-text" />
        </SpeechContainer>
      )}
      <div style={{ display: "flex" }}>
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
      </div>
    </SettingsButtonWrapper>
  );
};

export const RedoThreeIcon: React.FC<{ count: number }> = ({ count }) => {
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

interface QuickLevelChangeProps {
  setUseMic: (val: boolean) => void;
  useMic: boolean;
  isComplete: boolean;
  shuffleSentences: boolean;
  subLevels: string[] | undefined;
  nextExercise: (previous?: boolean) => void;
  clickSentenceAgain: () => void;
}

export const QuickLevelChange: React.FC<QuickLevelChangeProps> = ({
  useMic,
  subLevels,
  nextExercise,
  clickSentenceAgain,
  shuffleSentences,
  isComplete,
}) => {
  if (!isComplete) return <></>;
  return (
    <div className="grow-box">
      <div className="grow-box-content">
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
          <MenuButton
            disabled={!subLevels}
            style={{ fontSize: "15px", display: "flex", alignItems: "center" }}
            onClick={() => {
              nextExercise(true);
            }}
          >
            <FontAwesomeIcon style={{ color: "green", fontSize: "25px" }} icon={faArrowLeft} />
            Prev Exercise
          </MenuButton>
          <MenuButton onClick={() => clickSentenceAgain()} style={{ color: shuffleSentences ? "green" : "red" }}>
            <FontAwesomeIcon icon={faSyncAlt} />
            <div style={{ fontSize: "12px", color: "white" }}>Again</div>
          </MenuButton>
          <MenuButton
            disabled={!subLevels}
            style={{ fontSize: "15px", display: "flex", alignItems: "center" }}
            onClick={() => {
              nextExercise();
            }}
          >
            Next Exercise <FontAwesomeIcon style={{ color: "green", fontSize: "25px" }} icon={faArrowRight} />
          </MenuButton>
        </div>
      </div>
    </div>
  );
};

export default SettingsRow;

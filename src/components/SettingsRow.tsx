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
import { focusNextInput, getScoreColorRange } from "../helpers/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";

export const SettingsRow = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shouldSave, shuffleSentences, useMic, useGapFill, hasGapFill, redoErrors } = settings;

  const setRedoErrors = (redoErrors: boolean) => {
    dispatch(settingsActions.setRedoErrors(redoErrors));
    localStorage.setItem("redoErrors", JSON.stringify(redoErrors));
  };

  const configUseGapFill = () => {
    dispatch(settingsActions.setUseGapFill(!settings.useGapFill));
    localStorage.setItem("useGapFill", JSON.stringify(!settings.useGapFill));
  };

  const setUseMic = (val: boolean) => {
    dispatch(settingsActions.setUseMic(val));
  };

  const recognition = useSpeechRecognition("de-DE", useMic);
  const seeFeature = localStorage.getItem("userId") === "68988da2b947c4d46023d679";

  const setShouldSave = (val: boolean) => {
    dispatch(settingsActions.setShouldSave(val));
  };

  const setShuffleSentences = (val: boolean) => {
    dispatch(settingsActions.setShuffleSentences(val));
  };

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
          style={{ color: shuffleSentences ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          <div style={{ fontSize: "12px", color: "white" }}>Shuffle</div>
        </MenuButton>
        <MenuButton
          onClick={() => setShouldSave(!shouldSave)}
          style={{ color: shouldSave ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
        >
          <FontAwesomeIcon icon={faSave} />
          <div style={{ fontSize: "12px", color: "white" }}>Save</div>
        </MenuButton>

        <MenuButton
          disabled={!hasGapFill}
          onClick={() => configUseGapFill()}
          style={{ color: useGapFill && hasGapFill ? "rgba(236, 80, 80, 1)" : "currentcolor" }}
        >
          <FontAwesomeIcon icon={useGapFill && hasGapFill ? faEdit : faHighlighter} />
          <div style={{ fontSize: "12px", color: "white" }}>Gap Fill</div>
        </MenuButton>

        <MenuButton
          disabled={!hasGapFill}
          onClick={() => setRedoErrors(!redoErrors)}
          style={{ color: redoErrors ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
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
            style={{ color: useMic ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
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
  nextExercise: (previous?: boolean) => void;
  clickSentenceAgain: () => void;
}

export const QuickLevelChange: React.FC<QuickLevelChangeProps> = ({ nextExercise, clickSentenceAgain }) => {
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shuffleSentences, isComplete } = settings;

  const subLevelScoreText = () => {
    const storedLevel = localStorage.getItem("selectedLevel");
    const storedSubLevel = localStorage.getItem("selectedSubLevel") || null;
    if (!storedLevel || !storedSubLevel) return;
    const localSave = localStorage.getItem(`translation-score-${storedLevel}-${storedSubLevel}`);
    if (localSave === "null" || localSave === null) return;
    const localSaveJson = JSON.parse(localSave);
    return <span style={{ color: getScoreColorRange(localSaveJson.score) }}>{`(${localSaveJson.score}%)`}</span>;
  };

  if (!isComplete) return <></>;
  const score = subLevelScoreText();
  return (
    <div className="grow-box">
      {score && <div style={{ fontSize: "25px", paddingBottom: "5px" }}>Score: {score}</div>}
      <div className="grow-box-content">
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
          <MenuButton
            disabled={!subLevels}
            style={{ fontSize: "15px", display: "flex", alignItems: "center" }}
            onClick={() => {
              nextExercise(true);
            }}
          >
            <FontAwesomeIcon style={{ color: "rgba(49, 196, 141, 1)", fontSize: "25px" }} icon={faArrowLeft} />
            Prev Exercise
          </MenuButton>
          <MenuButton
            onClick={() => clickSentenceAgain()}
            style={{ color: shuffleSentences ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
          >
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
            Next Exercise{" "}
            <FontAwesomeIcon style={{ color: "rgba(49, 196, 141, 1)", fontSize: "25px" }} icon={faArrowRight} />
          </MenuButton>
        </div>
      </div>
    </div>
  );
};

export default SettingsRow;

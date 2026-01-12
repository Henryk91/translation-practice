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
  faComments,
  faCog,
  faCompass,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoticeModal from "./NoticeModal";
import { focusNextInput, getScoreColorRange } from "../helpers/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";

export const SettingsRow = () => {
  const dispatch = useDispatch();
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showMicNotice, setShowMicNotice] = React.useState(false);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shouldSave, shuffleSentences, useMic, useGapFill, hasGapFill, redoErrors, chatUi, showNav } = settings;

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
  const setChatUi = (val: boolean) => {
    dispatch(settingsActions.setChatUi(val));
  };

  const recognition = useSpeechRecognition("de-DE", useMic);

  const setShouldSave = (val: boolean) => {
    dispatch(settingsActions.setShouldSave(val));
  };

  const setShuffleSentences = (val: boolean) => {
    dispatch(settingsActions.setShuffleSentences(val));
  };

  const tooltips = {
    settings: showAdvanced ? "Close settings" : "Open advanced settings like Save, Gap Fill, and Error Retry",
    nav: "Toggle exercise navigation controls (Prev/Next Exercise)",
    shuffle: "Randomize the order of sentences in the current exercise",
    save: "Automatically save your progress and score to your profile",
    gapFill: "Practice by filling in specific missing words instead of whole sentences",
    errorRetry: "Incorrectly answered sentences will be repeated 3 times to reinforce learning",
    chat: "Switch to an interactive chat interface for your practice",
    mic: "Use voice-to-text to answer questions verbally",
  };

  const handleMicClick = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowMicNotice(true);
      return;
    }

    if (useMic) {
      recognition?.current?.stop();
    } else {
      focusNextInput(undefined);
      recognition?.current?.start();
    }
    setUseMic(!useMic);
  };

  return (
    <SettingsButtonWrapper>
      {useMic && (
        <SpeechContainer>
          <TextInput id="interim-text" />
        </SpeechContainer>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        <MenuButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          title={tooltips.settings}
          style={{ color: showAdvanced ? "rgba(236, 80, 80, 1)" : "rgba(49, 196, 141, 1)" }}
        >
          <FontAwesomeIcon icon={showAdvanced ? faTimes : faCog} />
          <div style={{ fontSize: "12px" }}>{showAdvanced ? "Close" : "Settings"}</div>
        </MenuButton>

        <MenuButton
          onClick={() => dispatch(settingsActions.setNav(!showNav))}
          title={tooltips.nav}
          style={{ color: showNav ? "rgba(49, 196, 141, 1)" : "white" }}
        >
          <FontAwesomeIcon icon={faCompass} />
          <div style={{ fontSize: "12px" }}>Nav</div>
        </MenuButton>

        <MenuButton
          onClick={() => setShuffleSentences(!shuffleSentences)}
          title={tooltips.shuffle}
          style={{ color: shuffleSentences ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          <div style={{ fontSize: "12px", color: "white" }}>Shuffle</div>
        </MenuButton>

        {showAdvanced && (
          <>
            <MenuButton
              onClick={() => setShouldSave(!shouldSave)}
              title={tooltips.save}
              style={{ color: shouldSave ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
            >
              <FontAwesomeIcon icon={faSave} />
              <div style={{ fontSize: "12px", color: "white" }}>Save</div>
            </MenuButton>

            <MenuButton
              disabled={!hasGapFill}
              onClick={() => configUseGapFill()}
              title={tooltips.gapFill}
              style={{ color: useGapFill && hasGapFill ? "rgba(236, 80, 80, 1)" : "currentcolor" }}
            >
              <FontAwesomeIcon icon={useGapFill && hasGapFill ? faEdit : faHighlighter} />
              <div style={{ fontSize: "12px", color: "white" }}>Gap Fill</div>
            </MenuButton>

            <MenuButton
              onClick={() => setRedoErrors(!redoErrors)}
              title={tooltips.errorRetry}
              style={{ color: redoErrors ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
            >
              <RedoThreeIcon count={redoErrors ? 3 : 1} />
              <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Error Retry</div>
            </MenuButton>
          </>
        )}

        <MenuButton
          onClick={() => setChatUi(!chatUi)}
          title={tooltips.chat}
          style={{ color: "rgba(49, 196, 141, 1)", padding: "1px" }}
        >
          <FontAwesomeIcon icon={faComments} />
          <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Chat Mode</div>
        </MenuButton>

        <MenuButton
          onClick={handleMicClick}
          title={tooltips.mic}
          style={{ color: useMic ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
        >
          <FontAwesomeIcon icon={useMic ? faMicrophoneSlash : faMicrophone} />
          <div style={{ fontSize: "12px", color: "white" }}>Use Mic</div>
        </MenuButton>
      </div>

      <NoticeModal
        isOpen={showMicNotice}
        onClose={() => setShowMicNotice(false)}
        title="Microphone Feature Restricted"
        message="Voice-to-text functionality is currently only available for authenticated users. Please log in to your account to enable microphone support for your translation sessions."
      />
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
  hasMoreBatches: boolean;
}

export const QuickLevelChange: React.FC<QuickLevelChangeProps> = ({
  nextExercise,
  clickSentenceAgain,
  hasMoreBatches,
}) => {
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const settings = useSelector((state: RootState) => state.settings.settings);
  const { shuffleSentences, isComplete, showNav } = settings;

  const subLevelScoreText = () => {
    const storedLevel = localStorage.getItem("selectedLevel");
    const storedSubLevel = localStorage.getItem("selectedSubLevel") || null;
    if (!storedLevel || !storedSubLevel) return;
    const localSave = localStorage.getItem(`translation-score-${storedLevel}-${storedSubLevel}`);
    if (localSave === "null" || localSave === null) return;
    const localSaveJson = JSON.parse(localSave);
    return <span style={{ color: getScoreColorRange(localSaveJson.score) }}>{`(${localSaveJson.score}%)`}</span>;
  };

  if (!isComplete && !showNav) return <></>;
  const score = subLevelScoreText();
  const nextButtonLabel = hasMoreBatches ? "Next Batch" : "Next Exercise";

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
            {nextButtonLabel}{" "}
            <FontAwesomeIcon style={{ color: "rgba(49, 196, 141, 1)", fontSize: "25px" }} icon={faArrowRight} />
          </MenuButton>
        </div>
      </div>
    </div>
  );
};

export default SettingsRow;

import React from "react";
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
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoticeModal from "./NoticeModal";
import FeedbackModal from "./FeedbackModal";
import Tooltip from "./Tooltip";
import { focusNextInput, getScoreColorRange } from "../helpers/utils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { settingsActions } from "../store/settings-slice";
import {
  VerticalCollapsibleWrapper,
  MenuButton,
  SettingsButtonWrapper,
  NavWrapper,
  SpeechContainer,
  TextInput,
} from "../helpers/style";

export const SettingsRow = () => {
  const dispatch = useDispatch();
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showMicNotice, setShowMicNotice] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
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
    feedback: "Report a bug or suggest an improvement",
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
        <Tooltip text={tooltips.settings}>
          <MenuButton
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ color: showAdvanced ? "rgba(236, 80, 80, 1)" : "rgba(49, 196, 141, 1)" }}
          >
            <FontAwesomeIcon icon={showAdvanced ? faTimes : faCog} />
            <div style={{ fontSize: "12px" }}>{showAdvanced ? "Close" : "Settings"}</div>
          </MenuButton>
        </Tooltip>

        <Tooltip text={tooltips.nav}>
          <MenuButton
            onClick={() => dispatch(settingsActions.setNav(!showNav))}
            style={{ color: showNav ? "rgba(49, 196, 141, 1)" : "white" }}
          >
            <FontAwesomeIcon icon={faCompass} />
            <div style={{ fontSize: "12px" }}>Nav</div>
          </MenuButton>
        </Tooltip>

        <Tooltip text={tooltips.chat}>
          <MenuButton onClick={() => setChatUi(!chatUi)} style={{ color: "rgba(49, 196, 141, 1)", padding: "1px" }}>
            <FontAwesomeIcon icon={faComments} />
            <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Chat Mode</div>
          </MenuButton>
        </Tooltip>

        <Tooltip text={tooltips.mic}>
          <MenuButton
            onClick={handleMicClick}
            style={{ color: useMic ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
          >
            <FontAwesomeIcon icon={useMic ? faMicrophoneSlash : faMicrophone} />
            <div style={{ fontSize: "12px", color: "white" }}>Use Mic</div>
          </MenuButton>
        </Tooltip>

        <Tooltip text={tooltips.feedback}>
          <MenuButton onClick={() => setShowFeedbackModal(true)} style={{ color: "white" }}>
            <FontAwesomeIcon icon={faCommentDots} />
            <div style={{ fontSize: "12px" }}>Feedback</div>
          </MenuButton>
        </Tooltip>
      </div>

      <VerticalCollapsibleWrapper $isOpen={showAdvanced}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", padding: "5px 0" }}>
          <Tooltip text={tooltips.shuffle}>
            <MenuButton
              onClick={() => setShuffleSentences(!shuffleSentences)}
              style={{ color: shuffleSentences ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              <div style={{ fontSize: "12px", color: "white" }}>Shuffle</div>
            </MenuButton>
          </Tooltip>

          <Tooltip text={tooltips.save}>
            <MenuButton
              onClick={() => setShouldSave(!shouldSave)}
              style={{ color: shouldSave ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
            >
              <FontAwesomeIcon icon={faSave} />
              <div style={{ fontSize: "12px", color: "white" }}>Save</div>
            </MenuButton>
          </Tooltip>

          <Tooltip text={tooltips.gapFill}>
            <MenuButton
              disabled={!hasGapFill}
              onClick={() => configUseGapFill()}
              style={{ color: useGapFill && hasGapFill ? "rgba(236, 80, 80, 1)" : "currentcolor" }}
            >
              <FontAwesomeIcon icon={useGapFill && hasGapFill ? faEdit : faHighlighter} />
              <div style={{ fontSize: "12px", color: "white" }}>Gap Fill</div>
            </MenuButton>
          </Tooltip>

          <Tooltip text={tooltips.errorRetry}>
            <MenuButton
              onClick={() => setRedoErrors(!redoErrors)}
              style={{ color: redoErrors ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
            >
              <RedoThreeIcon count={redoErrors ? 3 : 1} />
              <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Error Retry</div>
            </MenuButton>
          </Tooltip>
        </div>
      </VerticalCollapsibleWrapper>

      <NoticeModal
        isOpen={showMicNotice}
        onClose={() => setShowMicNotice(false)}
        title="Microphone Feature Restricted"
        message="Voice-to-text functionality is currently only available for authenticated users. Please log in to your account to enable microphone support for your translation sessions."
      />
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
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

  const score = subLevelScoreText();
  const nextButtonLabel = hasMoreBatches ? "Next Batch" : "Next Exercise";

  return (
    <NavWrapper>
      <VerticalCollapsibleWrapper $isOpen={showNav || isComplete}>
        {score && isComplete && <div style={{ fontSize: "25px", paddingBottom: "10px" }}>Score: {score}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
          <Tooltip text="Go to the previous exercise">
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
          </Tooltip>
          <Tooltip text="Restart this exercise from the beginning">
            <MenuButton
              onClick={() => clickSentenceAgain()}
              style={{ color: shuffleSentences ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)" }}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              <div style={{ fontSize: "12px", color: "white" }}>Again</div>
            </MenuButton>
          </Tooltip>
          <Tooltip text={hasMoreBatches ? "Load the next set of sentences" : "Move to the next exercise"}>
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
          </Tooltip>
        </div>
      </VerticalCollapsibleWrapper>
    </NavWrapper>
  );
};

export default SettingsRow;

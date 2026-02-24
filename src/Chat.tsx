import {
  faCommentSlash,
  faLightbulb,
  faPaperPlane,
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { MenuButton, SpeechContainer, TextInput } from "./helpers/style";
import Tooltip from "./components/design-system/Tooltip";
import { Row } from "./types";
import { RootState } from "./store";
import { chatActions } from "./store/chat-slice";
import { settingsActions } from "./store/settings-slice";
import NoticeModal from "./features/session/components/NoticeModal";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";

interface ChatProps {
  level?: string;
  initialSentences: Row[];
  hideChat: () => void;
  goToNextLevel: () => void;
  onCorrect: (row: Row, userInput: string) => void;
}

const Chat: React.FC<ChatProps> = ({ initialSentences, hideChat, goToNextLevel, onCorrect }) => {
  const dispatch = useDispatch();
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const currentSentence = useSelector((state: RootState) => state.chat.currentSentence);
  const [userInput, setUserInput] = useState<string>("");
  const [previousInput, setPreviousInput] = useState<string>("");
  const [checkPunctuation] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const sentInitMessage = useRef(false);
  const subLevelRef = useRef(selectedSubLevel);
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const useMic = useSelector((state: RootState) => state.settings.settings.useMic);
  const recognition = useSpeechRecognition("de-DE", useMic);
  const [showMicNotice, setShowMicNotice] = useState(false);

  const handleMicClick = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowMicNotice(true);
      return;
    }

    if (useMic) {
      recognition?.current?.stop();
    } else {
      recognition?.current?.start();

      setTimeout(() => {
        userInputRef.current?.focus();
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }
    dispatch(settingsActions.setUseMic(!useMic));
  };

  useEffect(() => {
    // Only run welcome message/first sentence if messages are empty
    if (messages.length === 0 && initialSentences.length && !sentInitMessage.current) {
      sentInitMessage.current = true;
      const firstUncompleted = initialSentences.find((s) => !s.feedback) || initialSentences[0];
      dispatch(
        chatActions.addMessages([
          {
            text: "Welcome to the Language Learning App!\n\nType your translation of the sentence below.",
            type: "info",
          },
          { text: `${firstUncompleted.sentence}`, type: "bot" },
        ]),
      );
      dispatch(chatActions.setCurrentSentence(firstUncompleted));
      return;
    }

    // On Sub Level Change
    if (selectedSubLevel !== subLevelRef.current && initialSentences?.length) {
      subLevelRef.current = selectedSubLevel;
      const firstUncompleted = initialSentences.find((s) => !s.feedback) || initialSentences[0];

      dispatch(chatActions.setCurrentSentence(firstUncompleted));
      dispatch(
        chatActions.addMessages([
          { text: `New Level selected!\n${selectedSubLevel}`, type: "info" },
          { text: `${firstUncompleted.sentence}`, type: "bot" },
        ]),
      );
    }
  }, [selectedSubLevel, initialSentences, messages.length, dispatch]);

  const showAnswer = () => {
    dispatch(
      chatActions.addMessages([
        { text: `Show Answer`, type: "user" },
        { text: `${currentSentence?.translation ?? ""}`, type: "bot" },
      ]),
    );
    userInputRef.current?.focus();
  };

  const checkTranslation = () => {
    if (!currentSentence) return;
    const correctTranslation = currentSentence.translation;

    // Normalize inputs: trim and lower case
    const normalizedUserInput = userInput.trim().toLowerCase();
    const normalizedCorrectTranslation = correctTranslation.toLowerCase();

    // Remove punctuation from the correct translation if checking is off
    const finalCorrectTranslation = checkPunctuation
      ? normalizedCorrectTranslation
      : normalizedCorrectTranslation.replace(/[.,!?]/g, "");

    const finalUserInput = checkPunctuation ? normalizedUserInput : normalizedUserInput.replace(/[.,!?]/g, "");

    // Check if user input matches correct translation (ignoring spaces)
    let feedbackMessage: string;
    if (finalUserInput === finalCorrectTranslation) {
      onCorrect(currentSentence, userInput);

      // Find the next uncompleted sentence in the current batch, excluding the one we just finished
      const currentIndex = initialSentences.findIndex((s) => s.id === currentSentence.id);
      const nextUncompletedIndex = initialSentences.findIndex((s, idx) => idx > currentIndex && !s.feedback);

      // Add user input message before the feedback message
      dispatch(chatActions.addMessage({ text: `${userInput}`, type: "user" }));

      if (nextUncompletedIndex !== -1) {
        const nextSentence = initialSentences[nextUncompletedIndex];
        dispatch(chatActions.setCurrentSentence(nextSentence));
        feedbackMessage = `Correct! Here's another sentence:\n\n${nextSentence.sentence}`;
        dispatch(chatActions.addMessage({ text: `${feedbackMessage}`, type: "bot" }));
      } else {
        // Check if there are ANY uncompleted sentences left in the current batch (that are NOT the current one)
        const anyOtherUncompleted = initialSentences.find((s) => !s.feedback && s.id !== currentSentence.id);
        if (anyOtherUncompleted) {
          dispatch(chatActions.setCurrentSentence(anyOtherUncompleted));
          feedbackMessage = `Correct! Now try this one:\n\n${anyOtherUncompleted.sentence}`;
          dispatch(chatActions.addMessage({ text: `${feedbackMessage}`, type: "bot" }));
        } else {
          // Everything in this batch is complete
          feedbackMessage = `Congratulations! You've completed level. You will now move on to the next level.`;
          goToNextLevel();
        }
      }
      setUserInput("");
      setPreviousInput(userInput);
    } else {
      const userWords = normalizedUserInput.split(" ");
      const correctWords = finalCorrectTranslation.split(" ");
      const feedbackWords = correctWords
        .map((word: string, index: number) => {
          // Normalize words for comparison by stripping punctuation if strict checking is off
          const normalizeWord = (w: string) => (checkPunctuation ? w : w.replace(/[.,!?]/g, ""));
          const uWord = userWords[index] || "";
          return normalizeWord(uWord) === normalizeWord(word) ? word : "___";
        })
        .join(" ");

      if (userInput.trim() === "") {
        feedbackMessage = "You didn't enter any translation. Try again.";
      } else {
        feedbackMessage = `Incorrect. You got: ${feedbackWords}.\n\nTry again:\n${currentSentence.sentence}`;
      }

      // Add feedback message after the user's translation
      dispatch(
        chatActions.addMessages([
          { text: `${userInput}`, type: "user" },
          { text: `${feedbackMessage}`, type: "bot" },
        ]),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      e.preventDefault();
      checkTranslation();
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (userInput !== "" && previousInput !== "" && userInput === previousInput) {
      setUserInput("");
    }
  }, [userInput, previousInput]);

  return (
    <div className="chat-component-wrapper">
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.type}`}>
              {message.type === "bot" && <span style={{ fontWeight: "100" }}>LingoDrill</span>}
              <p style={{ margin: "unset" }}>
                {message.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        {messages.length > 0 && (
          <div className="translation-input">
            <textarea
              ref={userInputRef}
              className="chat-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your translation here..."
              onKeyDown={handleKeyDown}
            />
            {useMic && (
              <SpeechContainer>
                <TextInput id="interim-text" />
              </SpeechContainer>
            )}
            <div className="chat-button-container">
              <Tooltip text="Use voice-to-text to answer questions verbally">
                <MenuButton
                  onClick={handleMicClick}
                  style={{ color: useMic ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)", padding: "1px" }}
                >
                  <FontAwesomeIcon icon={useMic ? faMicrophoneSlash : faMicrophone} />
                  <div style={{ fontSize: "12px", color: "white" }}>Use Mic</div>
                </MenuButton>
              </Tooltip>
              <Tooltip text="Show the correct translation for this sentence">
                <MenuButton onClick={() => showAnswer()} style={{ color: "rgba(49, 196, 141, 1)" }}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Hint</div>
                </MenuButton>
              </Tooltip>
              <Tooltip text="Submit your translation and check if it's correct">
                <MenuButton
                  onClick={() => checkTranslation()}
                  disabled={!userInput.trim() && messages.length > 0}
                  style={{ color: "rgba(49, 196, 141, 1)" }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Send</div>
                </MenuButton>
              </Tooltip>
              <Tooltip text="Leave chat mode and return to the main exercise view">
                <MenuButton onClick={() => hideChat()} style={{ color: "rgba(49, 196, 141, 1)" }}>
                  <FontAwesomeIcon icon={faCommentSlash} />
                  <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Hide Chat</div>
                </MenuButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      <NoticeModal
        isOpen={showMicNotice}
        onClose={() => setShowMicNotice(false)}
        title="Microphone Feature Restricted"
        message="Voice-to-text functionality is currently only available for authenticated users. Please log in to your account to enable microphone support for your translation sessions."
      />
    </div>
  );
};

export default Chat;

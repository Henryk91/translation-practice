import { faCommentSlash, faLightbulb, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { MenuButton } from "./helpers/style";
import { Row } from "./helpers/types";
import { RootState } from "./store";
import { chatActions } from "./store/chat-slice";

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
  const messages = useSelector((state: RootState) => state.chat.mesages);
  const currentSentence = useSelector((state: RootState) => state.chat.currentSentence);
  const [userInput, setUserInput] = useState<string>("");
  const [checkPunctuation] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const sentInitMessage = useRef(false);
  const subLevelRef = useRef(selectedSubLevel);

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
        ])
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
        ])
      );
    }
  }, [selectedSubLevel, initialSentences, messages.length, dispatch]);

  const showAnswer = () => {
    dispatch(
      chatActions.addMessages([
        { text: `Show Answer`, type: "user" },
        { text: `${currentSentence?.translation ?? ""}`, type: "bot" },
      ])
    );
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
    } else {
      const userWords = normalizedUserInput.split(" ");
      const correctWords = finalCorrectTranslation.split(" ");
      const feedbackWords = correctWords
        .map((word: string, index: number) => (userWords[index] === word ? word : "___"))
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
        ])
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
              className="chat-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your translation here..."
              onKeyDown={handleKeyDown}
            />
            <div className="chat-button-container">
              <MenuButton onClick={() => showAnswer()} style={{ color: "rgba(49, 196, 141, 1)", padding: "5px" }}>
                <FontAwesomeIcon icon={faLightbulb} />
                <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Hint</div>
              </MenuButton>
              <MenuButton
                onClick={() => checkTranslation()}
                disabled={!userInput.trim() && messages.length > 0}
                style={{ color: "rgba(49, 196, 141, 1)", padding: "5px" }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Send</div>
              </MenuButton>
              <MenuButton onClick={() => hideChat()} style={{ color: "rgba(49, 196, 141, 1)", padding: "5px" }}>
                <FontAwesomeIcon icon={faCommentSlash} />
                <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Hide Chat</div>
              </MenuButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

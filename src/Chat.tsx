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
}

const Chat: React.FC<ChatProps> = ({ initialSentences, hideChat, goToNextLevel }) => {
  const dispatch = useDispatch();
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const messages = useSelector((state: RootState) => state.chat.mesages);
  const currentSentence = useSelector((state: RootState) => state.chat.currentSentence);
  const [userInput, setUserInput] = useState<string>("");
  const [checkPunctuation] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const sentenceRef = useRef(initialSentences);
  const sentInitMessage = useRef(false);

  useEffect(() => {
    // On Sub Level Change
    if (sentenceRef.current === initialSentences) return;
    sentenceRef.current = initialSentences;
    if (!selectedSubLevel || !initialSentences?.length) return;
    const firstSentence = initialSentences[0];

    dispatch(chatActions.setCurrentSentence(firstSentence));
    dispatch(
      chatActions.addMessages([
        { text: `New Level selected!\n${selectedSubLevel}`, type: "info" },
        { text: `${firstSentence.sentence}`, type: "bot" },
      ])
    );
  }, [selectedSubLevel, initialSentences, currentSentence, dispatch]);

  useEffect(() => {
    // Add welcome message and first sentence if it's the first render
    if (messages.length === 0 && initialSentences.length && !sentInitMessage.current) {
      sentInitMessage.current = true;
      dispatch(
        chatActions.addMessages([
          {
            text: "Welcome to the Language Learning App!\n\nType your translation of the sentence below.",
            type: "info",
          },
          { text: `${initialSentences[0].sentence}`, type: "bot" },
        ])
      );
      dispatch(chatActions.setCurrentSentence(initialSentences[0]));
    }
  }, [messages, initialSentences, dispatch, sentInitMessage]);

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
      const nextSentenceIndex = initialSentences.indexOf(currentSentence) + 1;

      // Add user input message before the feedback message
      dispatch(chatActions.addMessage({ text: `${userInput}`, type: "user" }));

      if (nextSentenceIndex < initialSentences.length) {
        const nextSentence = initialSentences[nextSentenceIndex].sentence;
        dispatch(chatActions.setCurrentSentence(initialSentences[nextSentenceIndex]));
        feedbackMessage = `Correct! Here's another sentence:\n\n${nextSentence}`;
        dispatch(chatActions.addMessage({ text: `${feedbackMessage}`, type: "bot" }));
      } else {
        // Level completed
        feedbackMessage = `Congratulations! You've completed level. You will now move on to the next level.`;
        goToNextLevel();
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
    <div className="app">
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
              <MenuButton onClick={() => hideChat()} style={{ color: "rgba(49, 196, 141, 1)", padding: "5px" }}>
                <FontAwesomeIcon icon={faCommentSlash} />
                <div style={{ fontSize: "12px", color: "white", zIndex: "10" }}>Hide Chat</div>
              </MenuButton>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

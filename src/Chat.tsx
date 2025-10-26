import { faCommentSlash, faLightbulb, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { MenuButton } from "./helpers/style";

type Message = { text: string; type: "bot" | "user" | "info" };
type Sentence = { en: string; de: string; [key: string]: any };

interface ChatProps {
  level?: string;
  initialSentences: Sentence[];
  hideChat: () => void;
  nextLevel: () => void;
}

const Chat: React.FC<ChatProps> = ({ initialSentences, hideChat, nextLevel, level }) => {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [checkPunctuation] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);

  // Effect to set sentences based on the selected level
  useEffect(() => {
    if (sentences.length === 0 || (initialSentences[0] && sentences[0]?.en !== initialSentences[0].en)) {
      setSentences(initialSentences);
      setCurrentSentence(initialSentences[0]);
    }
    if (
      sentences.length !== 0 &&
      initialSentences[0] &&
      sentences[0]?.en !== initialSentences[0].en &&
      messages.length > 0
    ) {
      setMessages((prevMessages: any) => [
        ...prevMessages,
        ...[
          { text: `New Level selected!\n${level}`, type: "info" },
          { text: `${initialSentences[0].en}`, type: "bot" },
        ],
      ]);
    }
    // Add welcome message and first sentence if it's the first render
    if (messages.length === 0 && initialSentences.length) {
      setMessages([
        {
          text: "Welcome to the Language Learning App!\n\nType your translation of the sentence below.",
          type: "info",
        },
        { text: `${initialSentences[0].en}`, type: "bot" },
      ]);
    }
  }, [messages.length, initialSentences, sentences, level]);

  const showAnswer = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Show Answer`, type: "user" },
      { text: `${currentSentence?.de ?? ""}`, type: "bot" },
    ]);
  };
  const checkTranslation = () => {
    if (!currentSentence) return;
    const correctTranslation = currentSentence.de;

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
      const nextSentenceIndex = sentences.indexOf(currentSentence) + 1;

      // Add user input message before the feedback message
      setMessages((prevMessages) => [...prevMessages, { text: `${userInput}`, type: "user" }]);

      if (nextSentenceIndex < sentences.length) {
        const nextSentence = sentences[nextSentenceIndex].en;
        setCurrentSentence(sentences[nextSentenceIndex]);
        feedbackMessage = `Correct! Here's another sentence:\n\n${nextSentence}`;
        setMessages((prevMessages) => [...prevMessages, { text: `${feedbackMessage}`, type: "bot" }]);
      } else {
        // Level completed
        feedbackMessage = `Congratulations! You've completed level. You will now move on to the next level.`;
        nextLevel();
      }
      setUserInput("");
    } else {
      const userWords = normalizedUserInput.split(" ");
      const correctWords = finalCorrectTranslation.split(" ");
      const feedbackWords = correctWords.map((word, index) => (userWords[index] === word ? word : "___")).join(" ");

      if (userInput.trim() === "") {
        feedbackMessage = "You didn't enter any translation. Try again.";
      } else {
        feedbackMessage = `Incorrect. You got: ${feedbackWords}.\n\nTry again:\n${currentSentence.en}`;
      }

      // Add feedback message after the user's translation
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${userInput}`, type: "user" },
        { text: `${feedbackMessage}`, type: "bot" },
      ]);
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

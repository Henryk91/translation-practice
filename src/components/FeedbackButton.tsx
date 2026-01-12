import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { MenuButton } from "../helpers/style";
import FeedbackModal from "./FeedbackModal";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const FeedbackButtonWrapper = styled.div<{ $isMenuOpen: boolean; $isChatMode: boolean }>`
  position: fixed;
  bottom: 3px;
  right: 20px;
  z-index: 999;
  @media (max-width: 600px) {
    bottom: 80px;
    left: 15px;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    opacity: ${(props) => (props.$isMenuOpen ? 0 : 1)};
    visibility: ${(props) => (props.$isMenuOpen || props.$isChatMode ? "hidden" : "visible")};
    pointer-events: ${(props) => (props.$isMenuOpen ? "none" : "auto")};
  }
`;

const StyledFeedbackButton = styled(MenuButton)`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
`;

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatUi = useSelector((state: RootState) => state.settings.settings.chatUi);

  useEffect(() => {
    const toggle = document.getElementById("toggle") as HTMLInputElement;
    if (!toggle) return;

    const handleChange = () => {
      setIsMenuOpen(toggle.checked);
    };

    toggle.addEventListener("change", handleChange);
    // Check initial state
    setIsMenuOpen(toggle.checked);

    return () => {
      toggle.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <>
      <FeedbackButtonWrapper $isMenuOpen={isMenuOpen} $isChatMode={chatUi} data-feedback-button>
        <StyledFeedbackButton onClick={() => setIsModalOpen(true)} title="Send Feedback">
          <FontAwesomeIcon icon={faCommentDots} />
        </StyledFeedbackButton>
      </FeedbackButtonWrapper>
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FeedbackButton;

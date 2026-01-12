import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background-color: rgba(20, 23, 34, 255);
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  text-align: center;
`;

const IconWrapper = styled.div`
  color: #f59e0b;
  font-size: 48px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: #e0e0e0;
  margin: 0 0 16px 0;
  font-size: 22px;
`;

const Message = styled.p`
  color: #a0a0a0;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  background-color: rgba(49, 196, 141, 1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: rgba(49, 196, 141, 0.8);
  }
`;

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, title, message }) => {
  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconWrapper>
          <FontAwesomeIcon icon={faExclamationCircle} />
        </IconWrapper>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <CloseButton onClick={onClose}>Understood</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NoticeModal;

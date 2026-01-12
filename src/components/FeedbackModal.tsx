import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import Tooltip from "./Tooltip";

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: rgba(20, 23, 34, 255);
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #333;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

const ModalTitle = styled.h2`
  color: #e0e0e0;
  margin: 0;
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  &:hover {
    background-color: rgba(51, 51, 51, 0.8);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #e0e0e0;
  font-size: 14px;
  text-align: left;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: rgba(10, 12, 19, 255);
  color: #e0e0e0;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: rgba(49, 196, 141, 1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: rgba(10, 12, 19, 255);
  color: #e0e0e0;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: rgba(49, 196, 141, 1);
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background-color: rgba(49, 196, 141, 1);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background-color: rgba(49, 196, 141, 0.8);
  }
  &:disabled {
    background-color: rgba(51, 51, 51, 0.4);
    color: rgba(57, 143, 106, 0.3);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  text-align: left;
`;

const SuccessMessage = styled.div`
  color: rgba(49, 196, 141, 1);
  font-size: 14px;
  text-align: left;
`;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("https://note.henryk.co.za/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          text: `${name}\n${email}\n${message}`,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName("");
      setEmail("");
      setMessage("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Send Feedback</ModalTitle>
          <Tooltip text="Close this window">
            <CloseButton onClick={handleClose} disabled={isSubmitting}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
          </Tooltip>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="Your name"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="your.email@example.com"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Your feedback or suggestions..."
            />
          </FormGroup>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>Thank you! Your feedback has been sent.</SuccessMessage>}
          <Tooltip text="Submit your message to the developers">
            <SubmitButton type="submit" disabled={isSubmitting}>
              <FontAwesomeIcon icon={faPaperPlane} />
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </SubmitButton>
          </Tooltip>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FeedbackModal;

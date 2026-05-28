import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

const SESSION_KEY = "enterHintShown";

const slideDown = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

const Toast = styled.div<{ $fading: boolean; $left: number }>`
  position: fixed;
  top: 32px;
  left: ${(props) => props.$left}px;
  transform: translateX(-50%);
  background-color: rgba(14, 17, 27, 0.98);
  color: rgb(230, 241, 255);
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 14px;
  border: 1px solid rgba(49, 196, 141, 0.45);
  box-shadow:
    0 0 0 1px rgba(49, 196, 141, 0.1),
    0 8px 28px rgba(0, 0, 0, 0.6);
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
  animation: ${slideDown} 0.25s ease forwards;
  opacity: ${(props) => (props.$fading ? 0 : 1)};
  transition: opacity 0.4s ease;
`;

const Kbd = styled.kbd`
  display: inline-block;
  background: rgba(49, 196, 141, 0.12);
  border: 1px solid rgba(49, 196, 141, 0.35);
  border-radius: 4px;
  padding: 1px 7px;
  font-size: 13px;
  font-family: inherit;
  color: rgba(49, 196, 141, 0.9);
  margin: 0 3px;
`;

const EnterHintToast: React.FC = () => {
  const [shown, setShown] = useState(false);
  const [fading, setFading] = useState(false);
  const [left, setLeft] = useState(0);
  const fadingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT") {
        document.removeEventListener("focusin", handleFocus);

        setTimeout(() => {
          const mainPage = document.querySelector(".main-page") as HTMLElement | null;
          if (mainPage) {
            const rect = mainPage.getBoundingClientRect();
            setLeft(rect.left + rect.width / 2);
          } else {
            setLeft(window.innerWidth / 2);
          }

          sessionStorage.setItem(SESSION_KEY, "1");
          setShown(true);

          fadingRef.current = setTimeout(() => setFading(true), 5000);
          hideRef.current = setTimeout(() => setShown(false), 5500);
        }, 3000);
      }
    };

    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("focusin", handleFocus);
      if (fadingRef.current) clearTimeout(fadingRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  if (!shown) return null;

  return (
    <Toast $fading={fading} $left={left}>
      Tip: press <Kbd>Enter</Kbd> to submit your answer or jump to the next input
    </Toast>
  );
};

export default EnterHintToast;

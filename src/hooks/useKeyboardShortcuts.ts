import { useEffect, useState } from "react";

export const useKeyboardShortcuts = () => {
  const [shiftButtonDown, setShiftButtonDown] = useState<boolean>(false);
  const [altButtonDown, setAltButtonDown] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftButtonDown(false);
      } else if (e.key === "Alt") {
        setAltButtonDown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftButtonDown(true);
      } else if (e.key === "Alt") {
        setAltButtonDown(true);
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { shiftButtonDown, altButtonDown };
};

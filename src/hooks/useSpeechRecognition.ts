import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { settingsActions } from "../store/settings-slice";

// Type for constructor
type SpeechRecognitionCtor = new () => SpeechRecognition;

// Get constructor (with webkit fallback + SSR safety)
const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | undefined => {
  if (typeof window === "undefined") return undefined; // SSR guard
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

export const reactInsertAtCursor = (element: HTMLInputElement | HTMLTextAreaElement, text: string): void => {
  const start = element.selectionStart ?? element.value.length;
  const end = element.selectionEnd ?? element.value.length;
  const newValue = element.value.slice(0, start) + text + element.value.slice(end);
  const proto = Object.getPrototypeOf(element);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (!desc?.set) return;

  desc.set.call(element, newValue);

  // Set caret after inserted text
  const caret = start + text.length;
  element.setSelectionRange(caret, caret);

  // Fire input event so React's onChange runs
  element.dispatchEvent(new Event("input", { bubbles: true }));
};

export function useSpeechRecognition(lang = "de-DE", start: boolean) {
  const dispatch = useDispatch();
  const recRef = useRef<SpeechRecognition | null>(null);
  const originalInputStateRef = useRef<{
    input: HTMLInputElement | HTMLTextAreaElement | null;
    originalValue: string;
    originalSelectionStart: number;
    originalSelectionEnd: number;
    hasSelection: boolean;
    currentInsertedLength: number; // Length of currently inserted text (including spaces)
  } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId !== "68988da2b947c4d46023d679") return;
    if (!start) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    const output = document.getElementById("interim-text") as HTMLInputElement;

    const restoreOriginalAndInsert = (
      input: HTMLInputElement | HTMLTextAreaElement,
      textToInsert: string,
      isFinal: boolean
    ) => {
      let state = originalInputStateRef.current;
      const currentSelectionStart = input.selectionStart ?? input.value.length;
      const currentSelectionEnd = input.selectionEnd ?? input.value.length;
      const hasSelection = currentSelectionStart !== currentSelectionEnd;

      if (!state || state.input !== input) {
        // First time or different input - save original state
        originalInputStateRef.current = {
          input,
          originalValue: input.value,
          originalSelectionStart: currentSelectionStart,
          originalSelectionEnd: currentSelectionEnd,
          hasSelection: hasSelection,
          currentInsertedLength: 0,
        };
        state = originalInputStateRef.current;
      }

      // Trim the text to insert (remove leading/trailing spaces)
      const trimmedText = textToInsert.trim();

      // Always restore from original value using original selection positions
      const beforeSelection = state.originalValue.slice(0, state.originalSelectionStart);
      const afterSelection = state.originalValue.slice(state.originalSelectionEnd);

      // Add spaces before and after if needed (but not at start/end of input)
      let textWithSpaces = trimmedText;

      // Add space before if there's text before and it doesn't end with a space
      if (beforeSelection.length > 0 && !beforeSelection.endsWith(" ")) {
        textWithSpaces = " " + textWithSpaces;
      }

      // Add space after if there's text after and it doesn't start with a space
      if (afterSelection.length > 0 && !afterSelection.startsWith(" ")) {
        textWithSpaces = textWithSpaces + " ";
      }

      const newValue = beforeSelection + textWithSpaces + afterSelection;

      // Update input value
      const proto = Object.getPrototypeOf(input);
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      if (desc?.set) desc.set.call(input, newValue);

      // Set cursor position after inserted/replaced text
      const newCursorPos = state.originalSelectionStart + textWithSpaces.length;
      input.setSelectionRange(newCursorPos, newCursorPos);

      // Fire input event so React's onChange runs
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Update inserted text length for next replacement
      if (!isFinal) {
        state.currentInsertedLength = textWithSpaces.length;
      } else {
        // Final text inserted, reset state
        originalInputStateRef.current = null;
      }

      // Update interim-text display
      if (output) output.value = isFinal ? "" : textToInsert;
    };

    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      const input = document.activeElement;

      if (!(input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement)) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript + " ";
        }
      }

      // Handle final text (replaces any interim text)
      if (finalText) {
        restoreOriginalAndInsert(input, finalText.trim(), true);
      } else if (interimText) {
        // Handle interim text (replaces previous interim text)
        restoreOriginalAndInsert(input, interimText.trim(), false);
      }
    };

    rec.onend = () => {
      // Clear any remaining interim text state
      originalInputStateRef.current = null;
      if (output) output.value = "";

      dispatch(settingsActions.setUseMic(false));
      // if (keepRunning.current || start) rec.start();
    };

    rec.start();
    recRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      originalInputStateRef.current = null;
      recRef.current = null;
    };
  }, [lang, start, dispatch]);

  return recRef;
}

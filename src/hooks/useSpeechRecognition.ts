import { useEffect, useRef } from "react";

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

export function useSpeechRecognition(lang = "de-DE", start: boolean, setUseMic: (val: boolean) => void) {
  const recRef = useRef<SpeechRecognition | null>(null);

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

    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      const input = document.activeElement instanceof HTMLInputElement ? document.activeElement : null;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript + " ";
          output.value = interimText;
        }
      }

      if (finalText && input) {
        reactInsertAtCursor(input, finalText);
        output.value = "";
      }
    };

    rec.start();
    recRef.current = rec;

    rec.onend = () => {
      setUseMic(false);
      // if (keepRunning.current || start) rec.start();
    };

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, [lang, start, setUseMic]);

  return recRef;
}

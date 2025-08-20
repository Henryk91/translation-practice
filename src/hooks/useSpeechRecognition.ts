import { useEffect, useRef } from "react";

// Type for constructor
type SpeechRecognitionCtor = new () => SpeechRecognition;

// Get constructor (with webkit fallback + SSR safety)
const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | undefined => {
  if (typeof window === "undefined") return undefined; // SSR guard
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

const reactSetInputValue = (input: HTMLInputElement, value: string) => {
  if (!input) return;
  const proto = Object.getPrototypeOf(input);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  desc?.set?.call(input, value.trim()); // use native setter
  input.dispatchEvent(new Event("input", { bubbles: true })); // notify React
  input.focus();
};

export const reactAppendInputValue = (element: HTMLInputElement | HTMLTextAreaElement | null, text: string): void => {
  if (!element) return;
  const proto = Object.getPrototypeOf(element);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");

  if (!desc?.set) return;
  const newValue = element.value + text;
  desc.set.call(element, newValue);

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.focus();
  element.selectionStart = element.selectionEnd = newValue.length;
};

export function useSpeechRecognition(lang = "de-DE", start: boolean) {
  const recRef = useRef<SpeechRecognition | null>(null);
  const keepRunning = useRef<boolean>(start);

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
    const output = document.getElementById("output") as HTMLInputElement;

    // Example event handler
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
          if (output && interimText !== "") {
            reactSetInputValue(output, interimText);
          }
        }
      }

      if (finalText && input) {
        reactAppendInputValue(input, finalText);
      }
    };

    rec.start();
    recRef.current = rec;

    rec.onend = () => {
      if (keepRunning.current) rec.start();
    };

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, [lang, start]);

  return recRef;
}

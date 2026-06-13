"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  type BrowserSpeechRecognition,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
} from "@/lib/speech-recognition";
import type { Language } from "@/lib/db/schema";

type UseVoiceJournalOptions = {
  language: Language;
  onTranscript: (text: string, isFinal: boolean) => void;
};

export function useVoiceJournal({ language, onTranscript }: UseVoiceJournalOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const start = useCallback(() => {
    setError(null);
    setInterimTranscript("");

    const recognition = createSpeechRecognition(language);
    if (!recognition) {
      setError("unsupported");
      return;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          onTranscriptRef.current(text.trim(), true);
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      if (event.error === "not-allowed") {
        setError("permission");
      } else if (event.error === "no-speech") {
        setError("no-speech");
      } else {
        setError("failed");
      }
      stop();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [language, stop]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isSupported: isSpeechRecognitionSupported(),
    isListening,
    interimTranscript,
    error,
    start,
    stop,
    toggle,
  };
}

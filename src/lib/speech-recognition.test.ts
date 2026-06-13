import { describe, expect, it } from "vitest";
import {
  getSpeechRecognitionClass,
  isSpeechRecognitionSupported,
  speechRecognitionLang,
} from "@/lib/speech-recognition";

describe("speechRecognitionLang", () => {
  it("uses Indian English for en", () => {
    expect(speechRecognitionLang("en")).toBe("en-IN");
  });

  it("uses Hindi for hi", () => {
    expect(speechRecognitionLang("hi")).toBe("hi-IN");
  });
});

describe("isSpeechRecognitionSupported", () => {
  it("returns false when window is undefined", () => {
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it("returns true when SpeechRecognition exists", () => {
    const original = global.window;
    // @ts-expect-error test shim
    global.window = {
      SpeechRecognition: class MockSpeechRecognition {},
    };
    expect(isSpeechRecognitionSupported()).toBe(true);
    expect(getSpeechRecognitionClass()).not.toBeNull();
    global.window = original;
  });
});

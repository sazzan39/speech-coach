// Browser SpeechRecognition, used only to get a rough word count so we can
// estimate pace. We don't use it to spot blocks or repetitions — ASR is built
// to smooth those out, so any "we detected 4 stutters" claim off a transcript
// would be made up.

/* eslint-disable @typescript-eslint/no-explicit-any */
const SR: any =
  (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
  null;

export function speechRecognitionAvailable(): boolean {
  return !!SR;
}

export function createTranscriber() {
  if (!SR) return null;
  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let finalText = "";

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + " ";
      }
    }
  };

  return {
    start() {
      finalText = "";
      try {
        recognition.start();
      } catch {
        // already running
      }
    },
    stop(): Promise<string> {
      return new Promise((resolve) => {
        recognition.onend = () => resolve(finalText.trim());
        try {
          recognition.stop();
        } catch {
          resolve(finalText.trim());
        }
      });
    },
  };
}

export function countWords(transcript: string): number {
  const trimmed = transcript.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

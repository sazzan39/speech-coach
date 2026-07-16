import { useEffect, useRef, useState } from "react";
import { startRecording, type Recorder as Rec } from "../lib/audioAnalyzer";
import { speechRecognitionAvailable } from "../lib/speechRecognition";
import type { SpeechMetrics } from "../state/types";
import { Button } from "./ui";

type Phase = "idle" | "recording" | "done" | "error";

export function Recorder({
  onComplete,
  maxSeconds = 60,
}: {
  onComplete: (result: { metrics: SpeechMetrics; audioUrl: string }) => void;
  maxSeconds?: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<Rec | null>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current!), []);

  const tick = () => {
    const rec = recRef.current;
    if (!rec) return;
    setLevel(rec.meter().level);
    const secs = (performance.now() - startRef.current) / 1000;
    setElapsed(secs);
    if (secs >= maxSeconds) {
      void stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const begin = async () => {
    setError("");
    try {
      recRef.current = await startRecording();
      startRef.current = performance.now();
      setPhase("recording");
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Couldn't reach the mic. Check your browser's permissions and give it another go — no rush.");
      setPhase("error");
    }
  };

  const stop = async () => {
    cancelAnimationFrame(rafRef.current!);
    const rec = recRef.current;
    if (!rec) return;
    setPhase("done");
    const result = await rec.stop();
    recRef.current = null;
    onComplete(result);
  };

  const size = 120 + level * 90;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative flex items-center justify-center h-64 w-64">
        {phase === "recording" && (
          <div
            className="absolute rounded-full bg-calm-200/50 transition-[width,height] duration-75"
            style={{ width: size, height: size }}
          />
        )}
        <div
          className={`relative z-10 rounded-full flex items-center justify-center h-32 w-32 text-white ${
            phase === "recording" ? "bg-calm-600" : "bg-calm-500"
          }`}
        >
          {phase === "idle" && <MicGlyph />}
          {phase === "recording" && (
            <span className="text-lg font-medium">{Math.floor(elapsed)}s</span>
          )}
          {phase === "done" && "✓"}
          {phase === "error" && "!"}
        </div>
      </div>

      {phase === "idle" && (
        <>
          <Button onClick={begin} className="mt-4">
            Start recording
          </Button>
          {!speechRecognitionAvailable() && (
            <p className="mt-3 text-xs text-calm-500 max-w-xs text-center">
              This browser won't give a words-per-minute reading, so we'll skip it and stick to pace
              and pauses. No problem.
            </p>
          )}
        </>
      )}
      {phase === "recording" && (
        <Button onClick={stop} variant="soft" className="mt-4">
          I'm done
        </Button>
      )}
      {phase === "error" && (
        <>
          <p className="mt-4 text-sm text-calm-600 max-w-xs text-center">{error}</p>
          <Button onClick={begin} variant="soft" className="mt-3">
            Try again
          </Button>
        </>
      )}
    </div>
  );
}

function MicGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

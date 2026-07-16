import { useRef, useState } from "react";
import { useStore } from "../state/store";
import type { SpeechMetrics } from "../state/types";
import { MoodCheck } from "./session/MoodCheck";
import { Breathing } from "./session/Breathing";
import { EasyOnset } from "./session/EasyOnset";
import { Reading } from "./session/Reading";
import { RecordStep } from "./session/RecordStep";
import { Button, Card } from "../components/ui";

type Step = "mood-before" | "breathing" | "easy-onset" | "reading" | "record" | "mood-after" | "complete";

const ORDER: Step[] = ["mood-before", "breathing", "easy-onset", "reading", "record", "mood-after", "complete"];
const STEP_LABELS = ["Check-in", "Breathe", "Onset", "Read", "Speak", "Check-in", "Done"];

export function DailySession({ onExit }: { onExit: () => void }) {
  const { recordMoodBefore, recordMoodAfter, logSession, name } = useStore();
  const [step, setStep] = useState<Step>("mood-before");
  const startedAt = useRef(Date.now());
  const completed = useRef<string[]>([]);
  const metricsRef = useRef<SpeechMetrics | undefined>(undefined);

  const idx = ORDER.indexOf(step);
  const go = (s: Step, tag?: string) => {
    if (tag) completed.current.push(tag);
    setStep(s);
  };

  const finish = () => {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    logSession({ minutes, modulesCompleted: completed.current, metrics: metricsRef.current });
    setStep("complete");
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex items-center justify-center gap-1.5 py-5">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= idx ? "bg-calm-500" : "bg-calm-100"
              }`}
            />
            <span className={`mt-1 text-[10px] ${i === idx ? "text-calm-600" : "text-calm-300"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-xl">
          {step === "mood-before" && (
            <MoodCheck
              when="before"
              onPick={(v) => {
                if (v) recordMoodBefore(v);
                go("breathing");
              }}
            />
          )}
          {step === "breathing" && <Breathing onDone={() => go("easy-onset", "breathing")} />}
          {step === "easy-onset" && <EasyOnset onDone={() => go("reading", "easy-onset")} />}
          {step === "reading" && <Reading onDone={() => go("record", "reading")} />}
          {step === "record" && (
            <RecordStep
              onDone={(m) => {
                metricsRef.current = m;
                completed.current.push("record");
                go("mood-after");
              }}
            />
          )}
          {step === "mood-after" && (
            <MoodCheck
              when="after"
              onPick={(v) => {
                if (v) recordMoodAfter(v);
                finish();
              }}
            />
          )}
          {step === "complete" && (
            <Card className="text-center">
              <h2 className="text-2xl font-semibold text-calm-900 mb-2">
                {name ? `Nice work, ${name}.` : "Nice work."}
              </h2>
              <p className="text-calm-700 mb-6 leading-relaxed">
                You turned up and practised. That's the whole thing — small, kind, repeated. It's on
                the board now, and nothing takes it off.
              </p>
              <Button onClick={onExit}>Back home</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

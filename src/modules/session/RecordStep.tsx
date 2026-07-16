import { useEffect, useState } from "react";
import { Recorder } from "../../components/Recorder";
import { recordingFeedback } from "../../lib/coachVoice";
import { aiFeedback, hasAiKey } from "../../lib/anthropic";
import { useStore } from "../../state/store";
import type { SpeechMetrics } from "../../state/types";
import { SPEAKING_PROMPTS } from "../../data/content";
import { pickOneDaily } from "../../lib/daily";
import { todayKey } from "../../lib/date";
import { Button, Card } from "../../components/ui";

// The payoff step: record, get the honest numbers, get a kind note back. If
// they've hooked up an AI coach we ask it for a warmer note, but the built-in
// coach shows first and stays if the AI call doesn't come back.
export function RecordStep({
  onDone,
}: {
  onDone: (metrics: SpeechMetrics | undefined) => void;
}) {
  const intensity = useStore((s) => s.intensity);
  const name = useStore((s) => s.name);
  const [result, setResult] = useState<{ metrics: SpeechMetrics; audioUrl: string } | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const prompt = pickOneDaily(SPEAKING_PROMPTS, todayKey(), "speak");

  useEffect(() => {
    if (!result) return;
    // show the built-in note straight away, swap in the AI one if it arrives
    const base = recordingFeedback(result.metrics, intensity);
    setLines(base);
    if (hasAiKey()) {
      setAiLoading(true);
      aiFeedback(result.metrics, intensity, name)
        .then((ai) => ai && setLines(ai))
        .catch(() => {
          /* keep rule-based fallback */
        })
        .finally(() => setAiLoading(false));
    }
  }, [result, intensity, name]);

  if (result) {
    const m = result.metrics;
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold text-calm-900 mb-4 text-center">A word from your coach</h2>

        <audio controls src={result.audioUrl} className="mb-5 w-full max-w-sm" />

        <Card className="max-w-md w-full mb-5">
          <ul className="space-y-3">
            {lines.map((l, i) => (
              <li key={i} className="text-calm-700 leading-relaxed flex gap-2">
                <span className="text-calm-400">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
          {aiLoading && (
            <p className="mt-3 text-xs text-calm-400">Your AI coach is writing something…</p>
          )}
        </Card>

        {/* Objective numbers shown quietly, as neutral information — not a scoreboard. */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 text-center">
          <Stat label="Speaking time" value={`${m.speakingSeconds}s`} />
          <Stat label="Pauses taken" value={`${m.pauseCount}`} hint="allowed & healthy" />
          <Stat
            label="Pace"
            value={m.wordsPerMinute != null ? `${Math.round(m.wordsPerMinute)} wpm` : "—"}
            hint={m.wordsPerMinute == null ? "not measured" : undefined}
          />
        </div>

        <Button onClick={() => onDone(result.metrics)}>Finish session</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-calm-900 mb-1">Your turn</h2>
      <p className="text-calm-600 mb-4 text-sm max-w-sm">
        Talk for up to a minute. Blocks and pauses are welcome — just keep going, don't chase
        perfect.
      </p>
      <div className="rounded-2xl bg-calm-50 ring-1 ring-calm-100 px-5 py-4 mb-2 max-w-sm">
        <p className="text-xs text-calm-400 mb-1">Today's prompt</p>
        <p className="text-calm-800">{prompt}</p>
      </div>
      <Recorder onComplete={setResult} maxSeconds={60} />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-calm-50 ring-1 ring-calm-100 px-5 py-3 min-w-[110px]">
      <div className="text-lg font-semibold text-calm-800">{value}</div>
      <div className="text-xs text-calm-500">{label}</div>
      {hint && <div className="text-[10px] text-calm-400 mt-0.5">{hint}</div>}
    </div>
  );
}

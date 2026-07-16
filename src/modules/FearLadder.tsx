import { useState } from "react";
import { useStore } from "../state/store";
import { Recorder } from "../components/Recorder";
import { Button, Card } from "../components/ui";

// Graded exposure — the app's backbone, and the one screen that's allowed to
// feel like a game, because unlocking a rung means actual nerve. Rungs open in
// order; you decide when to have a go.
export function FearLadder({ onExit }: { onExit: () => void }) {
  const ladder = useStore((s) => s.ladder);
  const attemptRung = useStore((s) => s.attemptRung);
  const [active, setActive] = useState<number | null>(null);

  const highestCompleted = ladder.reduce((max, r) => (r.completed ? Math.max(max, r.level) : max), 0);

  const activeRung = ladder.find((r) => r.level === active);

  if (activeRung) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <Card>
            <p className="text-calm-500 text-sm mb-1">Level {activeRung.level}</p>
            <h2 className="text-2xl font-semibold text-calm-900 mb-3">{activeRung.title}</h2>
            <p className="text-calm-700 leading-relaxed mb-6">{activeRung.prompt}</p>

            <Recorder
              onComplete={() => {
                // having a go is the win — we don't grade how it sounded
                attemptRung(activeRung.level, true);
              }}
              maxSeconds={90}
            />

            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="soft"
                onClick={() => {
                  attemptRung(activeRung.level, true);
                  setActive(null);
                }}
              >
                I did it
              </Button>
              <Button variant="ghost" onClick={() => setActive(null)}>
                Back to ladder
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-semibold text-calm-900">Courage ladder</h1>
          <p className="text-calm-600 text-sm mt-1">
            One small brave step at a time. Having a go is the win — there's no failing here.
          </p>
        </div>
        <Button variant="ghost" onClick={onExit}>
          Close
        </Button>
      </div>

      <div className="space-y-3">
        {ladder.map((r) => {
          const unlocked = r.level <= highestCompleted + 1;
          return (
            <button
              key={r.level}
              disabled={!unlocked}
              onClick={() => setActive(r.level)}
              className={`w-full text-left rounded-2xl p-4 ring-1 flex items-center gap-4 transition-colors ${
                r.completed
                  ? "bg-calm-50 ring-calm-200"
                  : unlocked
                  ? "bg-white ring-calm-100 hover:ring-calm-400"
                  : "bg-calm-50/50 ring-calm-100 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
                  r.completed ? "bg-calm-500 text-white" : unlocked ? "bg-calm-100 text-calm-700" : "bg-calm-100 text-calm-400"
                }`}
              >
                {r.completed ? "✓" : unlocked ? r.level : "🔒"}
              </div>
              <div className="flex-1">
                <div className="font-medium text-calm-900">{r.title}</div>
                <div className="text-sm text-calm-600">{r.prompt}</div>
              </div>
              {r.attempted && !r.completed && (
                <span className="text-xs text-warmth-500">in progress</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

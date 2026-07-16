import { useMemo, useState } from "react";
import { useStore } from "../state/store";
import { useAuth } from "../state/authStore";
import type { CoachIntensity } from "../state/types";
import { consistencyLine, greeting, welcomeBackLine } from "../lib/coachVoice";
import { daysBetween, practicedInWindow, todayKey } from "../lib/date";
import { DAILY_AFFIRMATIONS } from "../data/content";
import { pickOneDaily } from "../lib/daily";
import { getAiKey, setAiKey } from "../lib/anthropic";
import { Button, Card, Pill, ProgressRing } from "../components/ui";

export function Home({ onStartSession, onOpenLadder }: { onStartSession: () => void; onOpenLadder: () => void }) {
  const state = useStore();
  const { name, intensity, totalDaysPracticed, sessions, moods, ladder, lastPracticeDate } = state;
  const setIntensity = useStore((s) => s.setIntensity);
  const reset = useStore((s) => s.reset);
  const logout = useAuth((s) => s.logout);
  const [keyInput, setKeyInput] = useState(getAiKey());
  const [keySaved, setKeySaved] = useState(false);

  const affirmation = pickOneDaily(DAILY_AFFIRMATIONS, todayKey(), "affirm");

  const rhythm = useMemo(() => practicedInWindow(sessions.map((s) => s.date), 30), [sessions]);
  const rungsDone = ladder.filter((r) => r.completed).length;
  const practicedToday = lastPracticeDate === todayKey();
  const welcomeBack = lastPracticeDate ? welcomeBackLine(daysBetween(lastPracticeDate, todayKey())) : null;

  const moodTrend = useMemo(() => {
    const withBoth = moods.filter((m) => m.after != null);
    if (!withBoth.length) return null;
    const deltas = withBoth.map((m) => m.before - (m.after as number)); // positive = calmer after
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return { avg, count: withBoth.length };
  }, [moods]);

  return (
    <div className="min-h-full max-w-2xl mx-auto p-4 pb-16">
      <header className="py-6">
        <p className="text-lg text-calm-800 leading-relaxed">{greeting(intensity, name)}</p>
        {welcomeBack && <p className="mt-2 text-sm text-warmth-500">{welcomeBack}</p>}
        <p className="mt-3 text-calm-600 italic">"{affirmation}"</p>
      </header>

      <Card className="mb-4 bg-gradient-to-br from-calm-600 to-calm-700 ring-0 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {practicedToday ? "Done for today" : "Today's session"}
            </h2>
            <p className="text-calm-50/90 text-sm">
              {practicedToday
                ? "Anything more is a bonus, never a must."
                : "About ten quiet minutes — breathe, warm up, read, speak."}
            </p>
          </div>
          <Button
            onClick={onStartSession}
            className="bg-white text-calm-700 hover:bg-calm-50 shrink-0"
          >
            {practicedToday ? "Practice again" : "Begin"}
          </Button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Card className="flex flex-col items-center">
          <ProgressRing value={rhythm} max={30} label="Your 30-day rhythm" />
          <p className="mt-3 text-center text-sm text-calm-600">
            {consistencyLine(totalDaysPracticed, intensity)}
          </p>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-calm-900 mb-1">Courage</h3>
            <p className="text-sm text-calm-600 mb-4">
              Ladder rungs you've taken on. Having a go is the win.
            </p>
            <div className="text-3xl font-semibold text-calm-800">
              {rungsDone}
              <span className="text-lg text-calm-400"> / {ladder.length}</span>
            </div>
          </div>
          <Button variant="soft" className="mt-4 self-start" onClick={onOpenLadder}>
            Open the ladder
          </Button>
        </Card>
      </div>

      {moodTrend && (
        <Card className="mb-4">
          <h3 className="font-semibold text-calm-900 mb-1">Practice and your nerves</h3>
          <p className="text-sm text-calm-600">
            {moodTrend.avg > 0.2
              ? `Across ${moodTrend.count} sessions you've mostly felt calmer afterwards than before. That's the point of it, quietly working.`
              : `You've logged ${moodTrend.count} before-and-after check-ins. Some days it settles the nerves, some days it doesn't — both are normal.`}
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <h3 className="font-semibold text-calm-900 mb-1">Coach intensity</h3>
        <p className="text-sm text-calm-600 mb-4">
          You set how much we push. Change it whenever.
        </p>
        <div className="flex gap-2">
          {(["gentle", "balanced", "push"] as CoachIntensity[]).map((k) => (
            <button key={k} onClick={() => setIntensity(k)} className="focus:outline-none">
              <Pill active={intensity === k}>{k[0].toUpperCase() + k.slice(1)}</Pill>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="font-semibold text-calm-900 mb-1">AI coach (optional)</h3>
        <p className="text-sm text-calm-600 mb-3">
          Add your own Claude key for warmer, more personal feedback. Leave it blank and the built-in
          coach does the job just fine.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setKeySaved(false);
            }}
            placeholder="sk-ant-..."
            className="flex-1 rounded-2xl border border-calm-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-calm-400"
          />
          <Button
            variant="soft"
            onClick={() => {
              setAiKey(keyInput);
              setKeySaved(true);
            }}
          >
            {keySaved ? "Saved ✓" : "Save"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-calm-400">
          Kept on this device, sent only to Anthropic. In production this call should run through a
          backend so the key never ships to the browser.
        </p>
      </Card>

      <div className="flex justify-center mb-4">
        <Button variant="ghost" onClick={logout}>
          Switch profile
        </Button>
      </div>

      <details className="text-sm text-calm-500 mt-2">
        <summary className="cursor-pointer hover:text-calm-700">About & privacy</summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          <p>
            This is a practice companion, not treatment, and it makes no claim to cure a stammer. For
            proper therapy, a speech-language pathologist is the person to see.
          </p>
          <p>
            Recordings are analysed in your browser and <strong>never leave your device</strong>.
            Progress is saved locally, per profile.
          </p>
          <button
            onClick={() => {
              if (confirm("Clear all your progress on this device? Can't be undone.")) reset();
            }}
            className="text-warmth-500 hover:underline"
          >
            Reset my data
          </button>
        </div>
      </details>
    </div>
  );
}

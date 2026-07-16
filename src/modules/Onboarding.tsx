import { useState } from "react";
import { useStore } from "../state/store";
import type { CoachIntensity } from "../state/types";
import { SOUND_GROUPS } from "../data/content";
import { Button, Card } from "../components/ui";

const INTENSITY_COPY: Record<CoachIntensity, { title: string; desc: string }> = {
  gentle: {
    title: "Gentle",
    desc: "Soft encouragement, no pressure. Good if this feels tender right now.",
  },
  balanced: {
    title: "Balanced",
    desc: "Warm, with a small nudge. A steady rhythm.",
  },
  push: {
    title: "Push me",
    desc: "More challenge, more momentum — still kind, never harsh. For when you want someone in your corner.",
  },
};

export default function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const profileName = useStore((s) => s.name);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profileName);
  const [intensity, setIntensity] = useState<CoachIntensity>("balanced");
  const [focusSounds, setFocusSounds] = useState<string[]>([]);

  const toggleSound = (key: string) =>
    setFocusSounds((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {step === 0 && (
          <Card>
            <p className="text-calm-500 text-sm mb-2">Welcome</p>
            <h1 className="text-2xl font-semibold text-calm-900 mb-3">
              A quiet place to practise speaking.
            </h1>
            <p className="text-calm-700 leading-relaxed mb-2">
              Straight up: this won't cure a stammer — nothing reliably does. What it can do is give
              you steady, evidence-based practice and help your confidence grow over time.
            </p>
            <p className="text-calm-700 leading-relaxed mb-6">
              We only ever track whether you <span className="font-medium">showed up</span> and{" "}
              <span className="font-medium">practised</span> — never how fluent you were on the day.
              Rough days are fine. Pauses are fine. Let's go.
            </p>
            <Button onClick={() => setStep(1)}>Start</Button>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <p className="text-calm-500 text-sm mb-2">Step 1 of 3</p>
            <h2 className="text-xl font-semibold text-calm-900 mb-4">What should we call you?</h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-2xl border border-calm-200 px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
            <div className="flex gap-3">
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <p className="text-calm-500 text-sm mb-2">Step 2 of 3</p>
            <h2 className="text-xl font-semibold text-calm-900 mb-2">How hard should we push?</h2>
            <p className="text-calm-600 mb-5 text-sm">
              Change it whenever you like. No wrong answer here — you know yourself best.
            </p>
            <div className="space-y-3 mb-6">
              {(Object.keys(INTENSITY_COPY) as CoachIntensity[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setIntensity(key)}
                  className={`w-full text-left rounded-2xl p-4 ring-1 transition-colors ${
                    intensity === key
                      ? "bg-calm-50 ring-calm-400"
                      : "bg-white ring-calm-100 hover:bg-calm-50"
                  }`}
                >
                  <div className="font-medium text-calm-900">{INTENSITY_COPY[key].title}</div>
                  <div className="text-sm text-calm-600">{INTENSITY_COPY[key].desc}</div>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <p className="text-calm-500 text-sm mb-2">Step 3 of 3</p>
            <h2 className="text-xl font-semibold text-calm-900 mb-2">
              Any sounds that trip you up?
            </h2>
            <p className="text-calm-600 mb-5 text-sm">
              Tap any that ring true, or none. We'll work these into your sessions. Just a starting
              point — you're not locked in.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(SOUND_GROUPS).map(([key, g]) => (
                <button
                  key={key}
                  onClick={() => toggleSound(key)}
                  className={`rounded-full px-4 py-2 text-sm ring-1 transition-colors ${
                    focusSounds.includes(key)
                      ? "bg-calm-600 text-white ring-calm-600"
                      : "bg-white text-calm-700 ring-calm-200 hover:bg-calm-50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <Button onClick={() => complete({ name: name.trim(), intensity, focusSounds })}>
              Take me in
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

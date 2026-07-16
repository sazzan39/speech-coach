import type { CoachIntensity, SpeechMetrics } from "../state/types";

// Optional AI coaching via Claude, called directly from the browser using the
// user's OWN key (stored locally, never sent anywhere but Anthropic). This is an
// MVP convenience — in production this call belongs behind a backend proxy so the
// key is never in the client. We keep the rule-based coach as the default so the
// app is fully functional with no key at all.

const KEY_STORAGE = "fluent:anthropic-key";
const MODEL = "claude-opus-4-8";

export function getAiKey(): string {
  return localStorage.getItem(KEY_STORAGE) || "";
}
export function setAiKey(key: string) {
  if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
  else localStorage.removeItem(KEY_STORAGE);
}
export function hasAiKey(): boolean {
  return !!getAiKey();
}

// The system prompt encodes the SAME compassion rules the rule-based coach
// follows — this is the single most important part of the AI integration.
const SYSTEM = `You are a warm, calm speech-practice coach for someone working on speaking confidence and stammering. Follow these rules without exception:

- NEVER claim to cure stuttering. There is no proven universal cure.
- Reward showing up and effort — NEVER judge fluency on a given day. A bad-anxiety day is not a failure.
- Pauses, blocks, and repetitions are welcome and normal. Frame them as healthy, never as mistakes.
- Do NOT lead with, or dwell on, disfluency counts. Never give a "fluency score".
- Open by honoring the courage it took to practice.
- You may gently mention objective metrics (pace, pauses, speaking time) as neutral information, framed kindly.
- Slower pace and pauses are tools, not flaws.
- Keep it short: 3-4 sentences of encouragement, warm but not saccharine.

Respond ONLY with a JSON array of 3-4 short strings (each one sentence). No prose outside the array.`;

export async function aiFeedback(
  m: SpeechMetrics,
  intensity: CoachIntensity,
  name: string
): Promise<string[] | null> {
  const key = getAiKey();
  if (!key) return null;

  const userMsg = `Coach intensity the user chose: ${intensity}${name ? `. Their name: ${name}` : ""}.
Objective metrics from their 60-second practice recording:
- Speaking time: ${m.speakingSeconds}s
- Pauses taken: ${m.pauseCount} (longest ${m.longestPauseMs}ms)
- Pace: ${m.wordsPerMinute != null ? `${Math.round(m.wordsPerMinute)} words/min` : "not measured"}

Give kind, effort-first feedback following your rules.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      // Required for direct browser calls (opts into CORS from the browser).
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const text: string = (data.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("")
    .trim();

  // The model is asked for a JSON array; parse defensively.
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1) {
      const arr = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) return arr;
    }
  } catch {
    /* fall through */
  }
  // If it didn't return clean JSON, split into sentences as a fallback.
  return text
    ? text.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4)
    : null;
}

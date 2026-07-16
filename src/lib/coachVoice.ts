import type { CoachIntensity, SpeechMetrics } from "../state/types";

// All the coach's lines live here. Rule of thumb when adding more: praise the
// effort, not the result. Nothing here should ever make someone feel worse for
// a rough day — that's the fast track to them quitting.

const todayGreetings: Record<CoachIntensity, string[]> = {
  gentle: [
    "Whenever you're ready. No pressure today.",
    "Good to see you. Even a couple of minutes counts.",
    "Take it slow — turning up is the win.",
  ],
  balanced: [
    "Ready when you are. Let's do a calm ten minutes.",
    "Nice to have you back. Small and steady today.",
    "Let's practice, at whatever pace feels right.",
  ],
  push: [
    "Let's get into it — calmly. You've got this.",
    "Back again. That's exactly how this works.",
    "Time to stretch a little. Still your pace, still kind.",
  ],
};

export function greeting(intensity: CoachIntensity, name: string): string {
  const pool = todayGreetings[intensity];
  const line = pool[Math.floor(Math.random() * pool.length)];
  return name ? `${greetByTime()}, ${name}. ${line}` : `${greetByTime()}. ${line}`;
}

function greetByTime(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

// After a recording. Lead with the effort, mention the numbers gently, never
// open with a stutter count or anything that reads like a grade.
export function recordingFeedback(m: SpeechMetrics, intensity: CoachIntensity): string[] {
  const lines: string[] = [];

  lines.push(
    intensity === "push"
      ? "Done — you turned up and put in the reps. That's the part that adds up."
      : "That took a bit of nerve, and you did it. That's what counts today."
  );

  if (m.wordsPerMinute != null) {
    if (m.wordsPerMinute > 170) {
      lines.push(
        `You were at about ${Math.round(m.wordsPerMinute)} words a minute — a touch quick. Next time, try starting each sentence a beat slower. No rush.`
      );
    } else if (m.wordsPerMinute < 90) {
      lines.push(
        `Nice and measured — around ${Math.round(m.wordsPerMinute)} words a minute. That slower pace is a real tool, not a flaw.`
      );
    } else {
      lines.push(`Your pace sat around ${Math.round(m.wordsPerMinute)} words a minute — a calm, natural range.`);
    }
  }

  if (m.pauseCount > 0) {
    lines.push(
      `You took ${m.pauseCount} pause${m.pauseCount === 1 ? "" : "s"}. Those are yours to take — they give the words room.`
    );
  }

  lines.push("Come back tomorrow if you can. Little and often is the whole trick.");
  return lines;
}

export function consistencyLine(totalDays: number, intensity: CoachIntensity): string {
  if (totalDays === 0) return "The first session is the hard one. Let's do it together.";
  if (totalDays === 1) return "One day in. You've started, which is genuinely the hard part.";
  const base = `You've practiced on ${totalDays} days. Nothing takes that away.`;
  return intensity === "push" ? `${base} Let's keep it rolling.` : base;
}

// Shown when someone comes back after a break. No guilt, no lost streaks — a
// gap is just a gap.
export function welcomeBackLine(daysSince: number): string | null {
  if (daysSince <= 1) return null;
  if (daysSince <= 3) return "Welcome back. Rest days are part of it — good to see you.";
  return "Welcome back. However long it's been, the practice you've already done still counts.";
}

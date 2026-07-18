# Fluent — a calm AI speech coach (MVP)

A confidence-first speaking practice app. It does **not** claim to cure stuttering
 there is no proven universal cure. It gives evidence-based practice, gently.

## The one design rule

Every mechanic rewards **showing up and practicing** (inputs the user controls),
never **fluency on a given day** (an outcome that punishes courage on a bad-anxiety
day). See `src/lib/coachVoice.ts` and `src/state/store.ts` — practice days never
reset to zero, and there is no fluency scoreboard.

## What's in this MVP

- **Local profiles / login** (`src/state/authStore.ts`, `src/modules/Login.tsx`):
  multiple people share a device, each with separate saved progress and an
  optional PIN. Data is namespaced per profile in `localStorage` behind a small
  storage seam (`src/lib/storage.ts`) so a real backend (Supabase) can drop in later.
- **Onboarding** with a user-controlled **coach intensity dial** (gentle / balanced / push).
- **Daily-changing content** (`src/lib/daily.ts`): a deterministic per-date RNG
  rotates the practice words, speaking prompt, reading passage, and home
  affirmation — fresh every calendar day, stable *within* a day (so a second
  session that day isn't chaotic).
- **Daily session** loop: mood check-in → breathing warm-up → easy-onset words
  (personalized to your hard sounds) → reading progression → 60s free speech →
  kind, effort-first feedback → mood check-out.
- **Honest audio analysis** (`src/lib/audioAnalyzer.ts`): pauses, speaking time,
  and volume from the raw waveform; words-per-minute from the browser
  SpeechRecognition transcript when available, `null` when it can't measure
  reliably. We deliberately do **not** fake disfluency detection — ASR normalizes
  disfluencies away, so claiming to count "blocks" from a transcript would mislead.
- **Optional AI coach** (`src/lib/anthropic.ts`): connect your own Claude API key
  (Home → AI coach) for warmer, personalized session feedback via `claude-opus-4-8`,
  called from the browser under a strict compassion-rules system prompt. Falls back
  to the local rule-based coach whenever there's no key or the call fails, so the
  app always works. (Production note: this browser call should go through a backend
  proxy so the key never ships to the client.)
- **Courage ladder**: graded exposure, the progression spine. Attempting a rung is
  the win; completion is never gated on a fluency measure.
- **Pacing / metronome** (`src/modules/Metronome.tsx`): evidence-based rhythm
  practice — visual pulse + optional Web-Audio click, slow by default, one
  syllable per beat.
- **Progress tracking** (`src/modules/Progress.tsx`): a 12-week practice-calendar
  heatmap, days/minutes/courage totals, before/after anxiety summary, and a pace
  sparkline. All input-based — no fluency scoreboard, no leaderboards, no guilt.
- **Mobile-friendly**: responsive layouts, a bottom tab bar (Home / Progress /
  Courage / Pacing), safe-area insets, and `prefers-reduced-motion` support.

Recordings are analyzed **in the browser** and never uploaded. Progress lives in
`localStorage` only, per profile.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. Best in Chrome (SpeechRecognition support for WPM). Grant
microphone access when the session's speaking step asks.

## Deliberately deferred (from the cofounder discussion)

- Real-time GPT voice conversation & DAF (latency traps, expensive) — next phase.
- Server-trained disfluency detection (e.g. SEP-28k) — the real data-flywheel bet,
  scoped as a separate spike before we build architecture around it.
- Accounts/backend — this MVP is local-first on purpose (privacy + speed to learn).


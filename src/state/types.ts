export type CoachIntensity = "gentle" | "balanced" | "push";

export interface MoodCheck {
  date: string; // YYYY-MM-DD
  before: number; // 1 calm .. 5 very anxious
  after: number | null;
}

export interface SpeechMetrics {
  wordsPerMinute: number | null; // null when we couldn't get a trustworthy reading
  pauseCount: number;
  longestPauseMs: number;
  speakingSeconds: number;
  averageVolume: number; // rough RMS, 0..1
}

export interface SessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  modulesCompleted: string[];
  metrics?: SpeechMetrics;
  courageRung?: number;
}

export interface LadderRung {
  level: number;
  title: string;
  prompt: string;
  attempted: boolean;
  completed: boolean;
}

export interface UserState {
  onboarded: boolean;
  name: string;
  intensity: CoachIntensity;
  focusSounds: string[]; // sounds the user finds hard, drives word/sentence picks

  sessions: SessionRecord[];
  // Running count of days practiced. Only goes up — a missed day never subtracts.
  // That's the whole point; don't "fix" this into a streak.
  totalDaysPracticed: number;
  lastPracticeDate: string | null;
  moods: MoodCheck[];
  ladder: LadderRung[];
}

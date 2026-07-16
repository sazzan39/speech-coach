import { create } from "zustand";
import type { CoachIntensity, MoodCheck, SessionRecord, UserState } from "./types";
import { DEFAULT_LADDER } from "../data/ladder";
import { todayKey } from "../lib/date";
import { cloudPull, cloudPush, loadLocal, saveLocal } from "../lib/storage";

interface Store extends UserState {
  // profile whose data is currently loaded into the store (null = none)
  activeProfileId: string | null;

  hydrate: (profileId: string, defaultName: string) => void;
  unload: () => void;
  completeOnboarding: (data: { name: string; intensity: CoachIntensity; focusSounds: string[] }) => void;
  setIntensity: (i: CoachIntensity) => void;
  logSession: (s: Omit<SessionRecord, "id" | "date">) => void;
  recordMoodBefore: (before: number) => void;
  recordMoodAfter: (after: number) => void;
  attemptRung: (level: number, completed: boolean) => void;
  reset: () => void;
}

const freshLadder = () => DEFAULT_LADDER.map((r) => ({ ...r, attempted: false, completed: false }));

const initial: UserState = {
  onboarded: false,
  name: "",
  intensity: "balanced",
  focusSounds: [],
  sessions: [],
  totalDaysPracticed: 0,
  lastPracticeDate: null,
  moods: [],
  ladder: freshLadder(),
};

// Pull just the persistable UserState slice out of the full store.
function extractUserState(s: Store): UserState {
  return {
    onboarded: s.onboarded,
    name: s.name,
    intensity: s.intensity,
    focusSounds: s.focusSounds,
    sessions: s.sessions,
    totalDaysPracticed: s.totalDaysPracticed,
    lastPracticeDate: s.lastPracticeDate,
    moods: s.moods,
    ladder: s.ladder,
  };
}

export const useStore = create<Store>((set) => ({
  ...initial,
  activeProfileId: null,

  hydrate: (profileId, defaultName) => {
    // load the local copy first so the UI is instant
    const saved = loadLocal(profileId);
    const apply = (data: Partial<UserState> | null) =>
      set({
        ...initial,
        ...data,
        ladder: data?.ladder ?? freshLadder(),
        name: data?.name ?? defaultName,
        activeProfileId: profileId,
      });
    apply(saved);
    // then, if we're on the cloud, pull the source-of-truth copy and swap it in
    cloudPull(profileId).then((remote) => {
      if (remote && useStore.getState().activeProfileId === profileId) apply(remote);
    });
  },

  unload: () => set({ ...initial, activeProfileId: null }),

  completeOnboarding: ({ name, intensity, focusSounds }) =>
    set({ onboarded: true, name, intensity, focusSounds }),

  setIntensity: (intensity) => set({ intensity }),

  logSession: (s) =>
    set((state) => {
      const today = todayKey();
      const session: SessionRecord = { ...s, id: crypto.randomUUID(), date: today };
      // totalDaysPracticed increments once per NEW calendar day only, and never
      // decreases. This is the anti-guilt core.
      const isNewDay = state.lastPracticeDate !== today;
      return {
        sessions: [...state.sessions, session],
        totalDaysPracticed: state.totalDaysPracticed + (isNewDay ? 1 : 0),
        lastPracticeDate: today,
      };
    }),

  recordMoodBefore: (before) =>
    set((state) => {
      const today = todayKey();
      const existing = state.moods.find((m) => m.date === today);
      if (existing) {
        return { moods: state.moods.map((m) => (m.date === today ? { ...m, before } : m)) };
      }
      const mood: MoodCheck = { date: today, before, after: null };
      return { moods: [...state.moods, mood] };
    }),

  recordMoodAfter: (after) =>
    set((state) => {
      const today = todayKey();
      return { moods: state.moods.map((m) => (m.date === today ? { ...m, after } : m)) };
    }),

  attemptRung: (level, completed) =>
    set((state) => ({
      ladder: state.ladder.map((r) =>
        r.level === level ? { ...r, attempted: true, completed: r.completed || completed } : r
      ),
    })),

  reset: () => set({ ...initial, ladder: freshLadder() }),
}));

// Save whenever the loaded profile's data changes — locally always, and to the
// cloud too (debounced) when signed in.
useStore.subscribe((state) => {
  if (!state.activeProfileId) return;
  const data = extractUserState(state);
  saveLocal(state.activeProfileId, data);
  cloudPush(state.activeProfileId, data);
});

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Lightweight local accounts. A "login" here means selecting/creating a local
// profile — no password by default (this is a personal practice device tool).
// An optional PIN is supported for shared devices. This is intentionally simple;
// the storage seam (src/lib/storage.ts) is where real cloud auth would slot in.

export interface Profile {
  id: string;
  name: string;
  pin?: string; // optional, plain — a light privacy latch, not real security
  createdAt: string;
}

interface AuthState {
  profiles: Profile[];
  currentId: string | null;
  createProfile: (name: string, pin?: string) => string;
  login: (id: string) => void;
  logout: () => void;
  deleteProfile: (id: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentId: null,

      createProfile: (name, pin) => {
        const id = crypto.randomUUID();
        const profile: Profile = {
          id,
          name: name.trim() || "You",
          pin: pin?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        set({ profiles: [...get().profiles, profile], currentId: id });
        return id;
      },

      login: (id) => set({ currentId: id }),
      logout: () => set({ currentId: null }),

      deleteProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
        })),
    }),
    { name: "fluent:profiles" }
  )
);

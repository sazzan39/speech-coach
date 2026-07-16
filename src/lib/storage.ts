import type { UserState } from "../state/types";
import { supabase, cloudEnabled } from "./supabase";

// Where practice data lives. Local mode: one localStorage key per profile. Cloud
// mode: same localStorage key as an offline cache, plus a row in Supabase that's
// the source of truth across devices. Callers don't care which — they just call
// these functions.

const PREFIX = "fluent:data:";

export function loadLocal(id: string): UserState | null {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as UserState) : null;
  } catch {
    return null;
  }
}

export function saveLocal(id: string, data: UserState): void {
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(data));
  } catch {
    // storage full or blocked — the session still works in memory
  }
}

export function deleteLocal(id: string): void {
  localStorage.removeItem(PREFIX + id);
}

// Pull the row for the signed-in user. Returns null if there's nothing yet.
export async function cloudPull(userId: string): Promise<UserState | null> {
  if (!cloudEnabled || !supabase) return null;
  const { data, error } = await supabase
    .from("practice_data")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.state as UserState;
}

// Debounced so we don't hammer the API on every keystroke-sized state change.
let pushTimer: ReturnType<typeof setTimeout> | undefined;
export function cloudPush(userId: string, data: UserState): void {
  if (!cloudEnabled || !supabase) return;
  const client = supabase;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    client
      .from("practice_data")
      .upsert({ user_id: userId, state: data, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn("cloud sync failed (kept locally):", error.message);
      });
  }, 800);
}

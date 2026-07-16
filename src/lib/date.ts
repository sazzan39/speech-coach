export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

// How many distinct days in the last `window` days had a session. Used for the
// forgiving "rhythm" ring — not a streak, so gaps don't reset anything.
export function practicedInWindow(dates: string[], window = 30): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (window - 1));
  const cutoffKey = todayKey(cutoff);
  return new Set(dates.filter((d) => d >= cutoffKey)).size;
}

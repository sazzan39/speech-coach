// Picks that change once a day and stay put until midnight. We seed a PRNG from
// the date string so "today's words" are the same whether you open the app at
// 8am or 8pm, but tomorrow you get a different set. Beats Math.random(), which
// would reshuffle every render and feel jittery.

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// salt lets different features (words vs prompts) rotate on their own cycle
// while each stays fixed for the day.
export function dailyRng(dateKey: string, salt = ""): () => number {
  return mulberry32(hashString(dateKey + "::" + salt));
}

export function pickDaily<T>(arr: T[], dateKey: string, n: number, salt = ""): T[] {
  const rng = dailyRng(dateKey, salt);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function pickOneDaily<T>(arr: T[], dateKey: string, salt = ""): T {
  const rng = dailyRng(dateKey, salt);
  return arr[Math.floor(rng() * arr.length)];
}

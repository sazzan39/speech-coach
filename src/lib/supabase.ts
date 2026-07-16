import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// If the two env vars are set we run in "cloud mode" — real email accounts and
// synced practice data. If they're not, everything falls back to local profiles
// and localStorage, and none of this code path runs. That's why the app works
// out of the box with no setup.

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cloudEnabled = Boolean(url && anon);

export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

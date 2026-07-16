import { create } from "zustand";
import { supabase } from "../lib/supabase";

// Real account auth, used only in cloud mode (when Supabase env vars are set).
// A "user" here is a Supabase auth user; `userId` is their auth.uid(), which is
// also the primary key of their row in practice_data and what RLS checks against.
// When cloud mode is off this store is never read — the local-profile authStore
// runs instead (see src/state/identity.ts).

interface CloudAuthState {
  ready: boolean; // has the initial session check completed?
  userId: string | null;
  email: string | null;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useCloudAuth = create<CloudAuthState>((set) => {
  // Wire up session tracking once, at store creation. Guarded so that importing
  // this module in local mode (supabase === null) is a harmless no-op.
  if (supabase) {
    const client = supabase;
    client.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      set({ userId: u?.id ?? null, email: u?.email ?? null, ready: true });
    });
    client.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      set({ userId: u?.id ?? null, email: u?.email ?? null, ready: true });
    });
  }

  return {
    // If there's no client we're not really in cloud mode; report ready so the UI
    // never hangs on a session check that will never resolve.
    ready: !supabase,
    userId: null,
    email: null,

    signUp: async (email, password) => {
      if (!supabase) return { error: "Cloud is not configured." };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      // With email confirmation on (Supabase default), sign-up returns no session
      // until the user clicks the link. Tell the UI to show a "check your inbox" state.
      return { needsConfirmation: !data.session };
    },

    signIn: async (email, password) => {
      if (!supabase) return { error: "Cloud is not configured." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },

    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
    },
  };
});

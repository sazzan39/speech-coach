import { cloudEnabled } from "../lib/supabase";
import { useAuth } from "./authStore";
import { useCloudAuth } from "./cloudAuth";

// One shared notion of "who is signed in", regardless of backend. In cloud mode
// this is a Supabase auth user; in local mode it's a selected local profile.
// Everything downstream (hydration, sign-out) keys off `userId` and doesn't care
// which backend produced it.
export interface Identity {
  ready: boolean; // initial auth check complete — false only briefly in cloud mode
  userId: string | null;
  name: string; // default display name (email local-part in cloud mode)
  signOut: () => void;
}

export function useIdentity(): Identity {
  // `cloudEnabled` is a module constant fixed at load, so this branch is stable
  // for the whole app lifetime — the conditional hook calls below never change
  // order between renders, which is what the rules of hooks actually require.
  if (cloudEnabled) {
    const ready = useCloudAuth((s) => s.ready);
    const userId = useCloudAuth((s) => s.userId);
    const email = useCloudAuth((s) => s.email);
    const signOut = useCloudAuth((s) => s.signOut);
    return { ready, userId, name: email ? email.split("@")[0] : "", signOut };
  }

  const currentId = useAuth((s) => s.currentId);
  const profiles = useAuth((s) => s.profiles);
  const logout = useAuth((s) => s.logout);
  const name = profiles.find((p) => p.id === currentId)?.name ?? "";
  return { ready: true, userId: currentId, name, signOut: logout };
}

import { useState } from "react";
import { useAuth } from "../state/authStore";
import { Button, Card } from "../components/ui";

// Local profile login. Selecting a profile loads that person's saved practice
// data. No password by default; an optional PIN adds a light privacy latch for
// shared devices.
export function Login() {
  const { profiles, createProfile, login } = useAuth();
  const [mode, setMode] = useState<"list" | "create">(profiles.length ? "list" : "create");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinFor, setPinFor] = useState<string | null>(null);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);

  const tryLogin = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (p?.pin) {
      setPinFor(id);
      setPinEntry("");
      setPinError(false);
    } else {
      login(id);
    }
  };

  const submitPin = () => {
    const p = profiles.find((x) => x.id === pinFor);
    if (p && p.pin === pinEntry.trim()) login(p.id);
    else setPinError(true);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-1">🌿</div>
          <h1 className="text-2xl font-semibold text-calm-900">Fluent</h1>
          <p className="text-calm-500 text-sm">Your calm speaking practice space</p>
        </div>

        {pinFor ? (
          <Card>
            <h2 className="text-lg font-semibold text-calm-900 mb-3">
              Enter PIN for {profiles.find((p) => p.id === pinFor)?.name}
            </h2>
            <input
              autoFocus
              value={pinEntry}
              onChange={(e) => {
                setPinEntry(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
              inputMode="numeric"
              type="password"
              placeholder="PIN"
              className="w-full rounded-2xl border border-calm-200 px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
            {pinError && <p className="text-warmth-500 text-sm mb-2">That PIN didn't match.</p>}
            <div className="flex gap-2">
              <Button onClick={submitPin}>Unlock</Button>
              <Button variant="ghost" onClick={() => setPinFor(null)}>
                Back
              </Button>
            </div>
          </Card>
        ) : mode === "list" ? (
          <Card>
            <h2 className="text-lg font-semibold text-calm-900 mb-4">Who's practicing?</h2>
            <div className="space-y-2 mb-4">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => tryLogin(p.id)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-white ring-1 ring-calm-100 hover:ring-calm-400 px-4 py-3 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-calm-100 flex items-center justify-center text-calm-700 font-semibold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-calm-900 font-medium flex-1 text-left">{p.name}</span>
                  {p.pin && <span className="text-calm-300 text-sm">🔒</span>}
                </button>
              ))}
            </div>
            <Button variant="soft" onClick={() => setMode("create")}>
              + New profile
            </Button>
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-semibold text-calm-900 mb-4">Create your profile</h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-calm-200 px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              type="password"
              placeholder="Optional PIN (for shared devices)"
              className="w-full rounded-2xl border border-calm-200 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
            <div className="flex gap-2">
              <Button onClick={() => createProfile(name, pin)} disabled={!name.trim()}>
                Create & continue
              </Button>
              {profiles.length > 0 && (
                <Button variant="ghost" onClick={() => setMode("list")}>
                  Back
                </Button>
              )}
            </div>
            <p className="mt-4 text-xs text-calm-400 leading-relaxed">
              Your data is stored only on this device. Recordings are analyzed in your browser and
              never uploaded.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

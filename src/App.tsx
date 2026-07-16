import { useEffect, useState } from "react";
import { useStore } from "./state/store";
import { useAuth } from "./state/authStore";
import { Login } from "./modules/Login";
import Onboarding from "./modules/Onboarding";
import { Home } from "./modules/Home";
import { DailySession } from "./modules/DailySession";
import { FearLadder } from "./modules/FearLadder";
import { Progress } from "./modules/Progress";
import { Metronome } from "./modules/Metronome";

type View = "home" | "session" | "ladder" | "progress" | "tools";

const NAV: { view: View; label: string; icon: string }[] = [
  { view: "home", label: "Home", icon: "🏠" },
  { view: "progress", label: "Progress", icon: "📈" },
  { view: "ladder", label: "Courage", icon: "🪜" },
  { view: "tools", label: "Pacing", icon: "🎵" },
];

export default function App() {
  const currentId = useAuth((s) => s.currentId);
  const profiles = useAuth((s) => s.profiles);
  const hydrate = useStore((s) => s.hydrate);
  const unload = useStore((s) => s.unload);
  const onboarded = useStore((s) => s.onboarded);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const [view, setView] = useState<View>("home");

  // Load the selected profile's data into the store (and clear it on logout).
  useEffect(() => {
    if (currentId) {
      const profile = profiles.find((p) => p.id === currentId);
      hydrate(currentId, profile?.name ?? "");
    } else {
      unload();
    }
  }, [currentId, profiles, hydrate, unload]);

  if (!currentId) return <Login />;
  // Wait for hydration to finish before deciding onboarding vs home.
  if (activeProfileId !== currentId) return null;
  if (!onboarded) return <Onboarding />;

  const showNav = view !== "session";

  return (
    <div className="min-h-full pb-16">
      {view === "home" && (
        <Home onStartSession={() => setView("session")} onOpenLadder={() => setView("ladder")} />
      )}
      {view === "session" && <DailySession onExit={() => setView("home")} />}
      {view === "ladder" && <FearLadder onExit={() => setView("home")} />}
      {view === "progress" && <Progress />}
      {view === "tools" && <Metronome />}

      {showNav && (
        <nav
          className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-calm-100 flex justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center py-2 px-3 flex-1 transition-colors ${
                view === item.view ? "text-calm-700" : "text-calm-400 hover:text-calm-600"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "../../components/ui";

// Breathing warm-up. In-hold-out with a long, slow out-breath, since that's the
// one you actually talk on.
const PHASES = [
  { label: "Breathe in", secs: 4, scale: 1.15 },
  { label: "Hold", secs: 2, scale: 1.15 },
  { label: "Breathe out slowly", secs: 6, scale: 0.72 },
] as const;

const TOTAL_CYCLES = 3;

export function Breathing({ onDone }: { onDone: () => void }) {
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState<number>(PHASES[0].secs);

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    if (cycle >= TOTAL_CYCLES) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // advance phase
        setPhaseIdx((pi) => {
          const next = (pi + 1) % PHASES.length;
          if (next === 0) setCycle((c) => c + 1);
          return next;
        });
        return PHASES[(phaseIdx + 1) % PHASES.length].secs;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phaseIdx, cycle]);

  const finished = cycle >= TOTAL_CYCLES;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-calm-900 mb-1">Settle your breath</h2>
      <p className="text-calm-600 mb-8 text-sm max-w-sm">
        Your voice rides on the out-breath. Three slow ones — let the exhale run long.
      </p>

      <div className="relative flex items-center justify-center h-72 w-72 mb-6">
        <div
          className="rounded-full bg-calm-300/60 transition-transform ease-in-out"
          style={{
            width: 180,
            height: 180,
            transform: `scale(${finished ? 1 : phase.scale})`,
            transitionDuration: `${finished ? 0.5 : phase.secs}s`,
          }}
        />
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-medium text-calm-800">
            {finished ? "Nicely done" : phase.label}
          </span>
          {!finished && <span className="text-calm-500 text-sm mt-1">{remaining}</span>}
        </div>
      </div>

      {!finished ? (
        <p className="text-calm-400 text-sm">Cycle {cycle + 1} of {TOTAL_CYCLES}</p>
      ) : (
        <Button onClick={onDone}>Continue</Button>
      )}
      {!finished && (
        <button onClick={onDone} className="mt-4 text-sm text-calm-400 hover:text-calm-600">
          Skip warm-up
        </button>
      )}
    </div>
  );
}

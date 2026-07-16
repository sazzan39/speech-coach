import { useMemo, useState } from "react";
import { useStore } from "../../state/store";
import { EASY_ONSET_CUE, SOUND_GROUPS } from "../../data/content";
import { pickDaily } from "../../lib/daily";
import { todayKey } from "../../lib/date";
import { Button } from "../../components/ui";

// Easy-onset word drill. Uses the person's focus sounds if they picked any,
// otherwise a general mix. Words rotate once a day. Tap through at your own pace.
export function EasyOnset({ onDone }: { onDone: () => void }) {
  const focusSounds = useStore((s) => s.focusSounds);

  const words = useMemo(() => {
    const keys = focusSounds.length ? focusSounds : Object.keys(SOUND_GROUPS);
    const pool: string[] = [];
    keys.forEach((k) => {
      const g = SOUND_GROUPS[k];
      if (g) pool.push(...g.words);
    });
    return pickDaily(pool, todayKey(), 10, "easy-onset");
  }, [focusSounds]);

  const [i, setI] = useState(0);
  const done = i >= words.length;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-calm-900 mb-1">Easy onset</h2>
      <p className="text-calm-600 mb-6 text-sm max-w-sm">{EASY_ONSET_CUE}</p>

      {!done ? (
        <>
          <div className="rounded-3xl bg-calm-50 ring-1 ring-calm-100 px-12 py-10 mb-6 min-w-[240px]">
            <span className="text-4xl font-semibold text-calm-800">{words[i]}</span>
          </div>
          <p className="text-calm-400 text-sm mb-5">
            Word {i + 1} of {words.length} — say it softly, twice, in your own time.
          </p>
          <Button onClick={() => setI(i + 1)}>Next word</Button>
          <button onClick={onDone} className="mt-4 text-sm text-calm-400 hover:text-calm-600">
            Skip ahead
          </button>
        </>
      ) : (
        <>
          <p className="text-calm-700 mb-6">Voice warmed up. Nice one.</p>
          <Button onClick={onDone}>Continue</Button>
        </>
      )}
    </div>
  );
}

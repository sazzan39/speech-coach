import { useState } from "react";
import { READING_PASSAGES } from "../../data/content";
import { Button } from "../../components/ui";

// Reading aloud — the easy on-ramp before free speech. The passages happen to
// double as little reminders to go easy on yourself.
export function Reading({ onDone }: { onDone: () => void }) {
  const [level, setLevel] = useState(0);
  const passage = READING_PASSAGES[level];
  const isLast = level >= READING_PASSAGES.length - 1;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-calm-900 mb-1">Read aloud</h2>
      <p className="text-calm-600 mb-6 text-sm max-w-sm">
        Easier than making it up as you go. Take it slow, pause wherever you want.
      </p>

      <div className="rounded-3xl bg-white ring-1 ring-calm-100 px-8 py-8 mb-6 max-w-md">
        <p className="text-2xl leading-relaxed text-calm-800">{passage.text}</p>
      </div>

      <p className="text-calm-400 text-sm mb-5">Passage {level + 1} of {READING_PASSAGES.length}</p>

      {!isLast ? (
        <div className="flex gap-3">
          <Button variant="soft" onClick={onDone}>
            That's enough
          </Button>
          <Button onClick={() => setLevel(level + 1)}>One more, a bit longer</Button>
        </div>
      ) : (
        <Button onClick={onDone}>Continue</Button>
      )}
    </div>
  );
}

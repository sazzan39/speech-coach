import { Button } from "../../components/ui";

const FACES = [
  { v: 1, emoji: "🙂", label: "Calm" },
  { v: 2, emoji: "😌", label: "Mostly ok" },
  { v: 3, emoji: "😐", label: "Neutral" },
  { v: 4, emoji: "😟", label: "Tense" },
  { v: 5, emoji: "😰", label: "Very anxious" },
];

export function MoodCheck({
  when,
  onPick,
}: {
  when: "before" | "after";
  onPick: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-calm-900 mb-1">
        {when === "before" ? "How anxious do you feel right now?" : "And now, after practicing?"}
      </h2>
      <p className="text-calm-600 mb-8 text-sm max-w-sm">
        {when === "before"
          ? "No right answer — it just helps us spot patterns over time."
          : "We'll note the difference. Often practice takes the edge off a bit."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {FACES.map((f) => (
          <button
            key={f.v}
            onClick={() => onPick(f.v)}
            className="flex flex-col items-center rounded-2xl bg-white ring-1 ring-calm-100 hover:ring-calm-400 hover:bg-calm-50 px-5 py-4 transition-colors w-24"
          >
            <span className="text-3xl mb-1">{f.emoji}</span>
            <span className="text-xs text-calm-600">{f.label}</span>
          </button>
        ))}
      </div>
      {when === "after" && (
        <Button variant="ghost" className="mt-6" onClick={() => onPick(0)}>
          Skip
        </Button>
      )}
    </div>
  );
}

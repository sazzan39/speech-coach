import { useMemo } from "react";
import { useStore } from "../state/store";
import { todayKey } from "../lib/date";
import { Card } from "../components/ui";

// The tracking screen. Everything shown is stuff you control — days, minutes,
// courage, nerves before vs after. No fluency scoreboard, on purpose.
export function Progress() {
  const { sessions, moods, ladder, totalDaysPracticed } = useStore();

  const practicedDates = useMemo(() => new Set(sessions.map((s) => s.date)), [sessions]);
  const totalMinutes = useMemo(() => sessions.reduce((a, s) => a + s.minutes, 0), [sessions]);
  const rungsDone = ladder.filter((r) => r.completed).length;

  // Last 12 weeks of days for a calm calendar heatmap.
  const weeks = useMemo(() => buildCalendar(84), []);

  const moodStats = useMemo(() => {
    const withBoth = moods.filter((m) => m.after != null);
    if (!withBoth.length) return null;
    const calmer = withBoth.filter((m) => m.before > (m.after as number)).length;
    return { total: withBoth.length, calmer };
  }, [moods]);

  // Pace trend over the last sessions that measured it.
  const paceSeries = useMemo(
    () =>
      sessions
        .map((s) => s.metrics?.wordsPerMinute)
        .filter((w): w is number => w != null)
        .slice(-12),
    [sessions]
  );

  return (
    <div className="min-h-full max-w-2xl mx-auto p-4 pb-24">
      <header className="py-6">
        <h1 className="text-2xl font-semibold text-calm-900">Your progress</h1>
        <p className="text-calm-500 text-sm mt-1">
          Built from turning up — not from how you sounded on the day.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Metric value={totalDaysPracticed} label="days practiced" />
        <Metric value={totalMinutes} label="minutes total" />
        <Metric value={`${rungsDone}/${ladder.length}`} label="courage rungs" />
      </div>

      <Card className="mb-4">
        <h3 className="font-semibold text-calm-900 mb-3">Practice calendar</h3>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day}
                  title={day}
                  className={`h-4 w-4 rounded-sm ${
                    day === todayKey()
                      ? practicedDates.has(day)
                        ? "bg-calm-500 ring-2 ring-calm-300"
                        : "bg-calm-100 ring-2 ring-calm-300"
                      : practicedDates.has(day)
                      ? "bg-calm-500"
                      : day > todayKey()
                      ? "bg-transparent"
                      : "bg-calm-100"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-calm-400 mt-2">
          Filled squares are days you practised. Gaps don't count against you — they're just gaps.
        </p>
      </Card>

      {moodStats && (
        <Card className="mb-4">
          <h3 className="font-semibold text-calm-900 mb-1">Nerves, before and after</h3>
          <p className="text-sm text-calm-600">
            In {moodStats.calmer} of {moodStats.total} check-ins you felt calmer afterwards. Some days
            it doesn't settle them — that's normal too.
          </p>
        </Card>
      )}

      {paceSeries.length > 1 && (
        <Card className="mb-4">
          <h3 className="font-semibold text-calm-900 mb-1">Pace over time</h3>
          <p className="text-sm text-calm-600 mb-4">
            Just for reference, not a target. A relaxed pace usually sits somewhere around 100–150.
          </p>
          <Sparkline values={paceSeries} />
        </Card>
      )}

      {sessions.length === 0 && (
        <Card>
          <p className="text-calm-600 text-center py-4">
            This fills in once you've done a session. Whenever you're ready — no rush.
          </p>
        </Card>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-calm-100 px-3 py-4 text-center">
      <div className="text-2xl font-semibold text-calm-800">{value}</div>
      <div className="text-[11px] text-calm-500 leading-tight mt-0.5">{label}</div>
    </div>
  );
}

// Build columns of weeks (7 day-keys each), oldest to newest, ending on today.
function buildCalendar(days: number): string[][] {
  const out: string[] = [];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(keyOf(d));
  }
  const weeks: string[][] = [];
  for (let i = 0; i < out.length; i += 7) weeks.push(out.slice(i, i + 7));
  return weeks;
}

function keyOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Sparkline({ values }: { values: number[] }) {
  const w = 280;
  const h = 60;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#357f83"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#357f83" />;
      })}
    </svg>
  );
}

import { useEffect, useRef, useState } from "react";
import { READING_PASSAGES } from "../data/content";
import { pickOneDaily } from "../lib/daily";
import { todayKey } from "../lib/date";
import { Button, Card } from "../components/ui";

// Pacing practice. Speaking to a steady beat, one syllable at a time, is an old
// fluency-shaping trick. Always a visual pulse; the click is optional since some
// people find it distracting. Starts slow on purpose.
export function Metronome() {
  const [bpm, setBpm] = useState(60);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(false);
  const [sound, setSound] = useState(false);
  const intervalRef = useRef<number>();
  const audioRef = useRef<AudioContext | null>(null);

  const passage = pickOneDaily(READING_PASSAGES, todayKey(), "metronome").text;

  useEffect(() => {
    if (!running) return;
    const period = 60000 / bpm;
    const tick = () => {
      setBeat((b) => !b);
      if (sound) click();
    };
    tick();
    intervalRef.current = window.setInterval(tick, period);
    return () => clearInterval(intervalRef.current);
  }, [running, bpm, sound]);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  const click = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      /* audio not available — visual pulse still works */
    }
  };

  return (
    <div className="min-h-full max-w-2xl mx-auto p-4 pb-24">
      <header className="py-6">
        <h1 className="text-2xl font-semibold text-calm-900">Pacing</h1>
        <p className="text-calm-500 text-sm mt-1">
          One syllable per beat. The rhythm takes the tension out — go slower than feels natural.
        </p>
      </header>

      <Card className="flex flex-col items-center mb-4">
        <div className="relative flex items-center justify-center h-56 w-56 mb-4">
          <div
            className="rounded-full bg-calm-400 transition-transform ease-out"
            style={{
              width: 120,
              height: 120,
              transform: running ? `scale(${beat ? 1.25 : 0.85})` : "scale(1)",
              transitionDuration: `${Math.min(300, 60000 / bpm / 2)}ms`,
              opacity: running ? 1 : 0.4,
            }}
          />
          <span className="absolute text-calm-800 font-medium">{bpm} bpm</span>
        </div>

        <div className="w-full max-w-xs mb-4">
          <input
            type="range"
            min={40}
            max={100}
            step={5}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-calm-600"
          />
          <div className="flex justify-between text-xs text-calm-400">
            <span>slower</span>
            <span>faster</span>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Button onClick={() => setRunning((r) => !r)}>{running ? "Stop" : "Start"}</Button>
          <label className="flex items-center gap-2 text-sm text-calm-600">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            Audio click
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-calm-900 mb-2">Read this to the beat</h3>
        <p className="text-xl leading-relaxed text-calm-800">{passage}</p>
        <p className="text-xs text-calm-400 mt-3">
          One syllable a pulse. Hit a block? Just jump back in on the next beat.
        </p>
      </Card>
    </div>
  );
}

import type { SpeechMetrics } from "../state/types";
import { countWords, createTranscriber } from "./speechRecognition";

// Records the mic and pulls out the things we can actually measure honestly:
// how long they spoke, how many pauses, the longest one, rough loudness. Pace
// comes from the transcript if the browser gives us one; otherwise it's null
// and we just don't show it rather than guess.

export interface LiveMeter {
  level: number; // 0..1, for the pulsing circle
  speaking: boolean;
}

const SILENCE_RMS = 0.015; // quieter than this = silence
const MIN_PAUSE_MS = 400; // a gap has to last this long to count as a pause
const FRAME_MS = 50;

export interface Recorder {
  meter: () => LiveMeter;
  stop: () => Promise<{ metrics: SpeechMetrics; audioUrl: string }>;
}

export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);

  const mediaRecorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
  mediaRecorder.start();

  const transcriber = createTranscriber();
  transcriber?.start();

  let speakingMs = 0;
  let pauseCount = 0;
  let longestPauseMs = 0;
  let currentSilenceMs = 0;
  let hasSpokenYet = false;
  let volumeSum = 0;
  let volumeSamples = 0;
  let currentLevel = 0;
  let currentSpeaking = false;

  const rms = () => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  };

  const interval = setInterval(() => {
    const level = rms();
    currentLevel = Math.min(1, level * 6);
    const speaking = level > SILENCE_RMS;
    currentSpeaking = speaking;

    if (speaking) {
      hasSpokenYet = true;
      speakingMs += FRAME_MS;
      volumeSum += level;
      volumeSamples++;
      // a silence just ended; if it was long enough, log it as a pause
      if (currentSilenceMs >= MIN_PAUSE_MS) {
        pauseCount++;
        longestPauseMs = Math.max(longestPauseMs, currentSilenceMs);
      }
      currentSilenceMs = 0;
    } else if (hasSpokenYet) {
      // ignore the quiet lead-in before they start talking
      currentSilenceMs += FRAME_MS;
    }
  }, FRAME_MS);

  return {
    meter: () => ({ level: currentLevel, speaking: currentSpeaking }),
    stop: async () => {
      clearInterval(interval);

      const transcript = transcriber ? await transcriber.stop() : "";

      const blob: Blob = await new Promise((resolve) => {
        mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
        mediaRecorder.stop();
      });

      stream.getTracks().forEach((t) => t.stop());
      await audioCtx.close();

      const speakingSeconds = speakingMs / 1000;
      const words = countWords(transcript);
      // only trust pace if we got a real handful of words over a real stretch
      const wordsPerMinute =
        words > 3 && speakingSeconds > 3 ? (words / speakingSeconds) * 60 : null;

      const metrics: SpeechMetrics = {
        wordsPerMinute,
        pauseCount,
        longestPauseMs: Math.round(longestPauseMs),
        speakingSeconds: Math.round(speakingSeconds * 10) / 10,
        averageVolume: volumeSamples ? volumeSum / volumeSamples : 0,
      };

      return { metrics, audioUrl: URL.createObjectURL(blob) };
    },
  };
}

import type { LadderRung } from "../state/types";

// The ladder is the backbone of the app — the one spot where climbing a level
// is a genuine little thrill, because each rung is real-world nerve, not points.
export const DEFAULT_LADDER: Omit<LadderRung, "attempted" | "completed">[] = [
  { level: 1, title: "Say hello", prompt: "Record yourself saying \"Hi, my name is ___.\" That's it. One breath, soft start." },
  { level: 2, title: "Introduce yourself", prompt: "Tell the mic three things about yourself, relaxed pace. No rush." },
  { level: 3, title: "Order a coffee", prompt: "Picture a cafe. Out loud: \"Hi, could I get a medium latte please?\" Do it twice." },
  { level: 4, title: "Ask a question", prompt: "Ask something out loud you'd usually dodge — \"Excuse me, where's the nearest station?\"" },
  { level: 5, title: "Leave a voicemail", prompt: "Record a 30-second voicemail as if you're booking an appointment." },
  { level: 6, title: "Talk for a minute", prompt: "Talk about anything for a full minute. Blocks are welcome here — the goal is to keep going, not to be smooth." },
  { level: 7, title: "Mock interview", prompt: "Answer out loud: \"Tell me about yourself and why you want this role.\"" },
  { level: 8, title: "Out in the world", prompt: "Pick one small real interaction today — order out loud, make a call, ask a stranger the time. Come back and note how it went." },
];

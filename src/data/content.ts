// Words grouped by their opening sound, so we can lean on whichever ones a
// person finds hard. Targeted easy-onset practice on feared sounds is a real
// therapy staple, not something we invented.

export const SOUND_GROUPS: Record<string, { label: string; words: string[]; phrases: string[] }> = {
  b: {
    label: "B",
    words: ["blue", "bread", "brave", "beach", "balloon", "begin", "because", "beautiful"],
    phrases: ["Blue balloon", "Buy fresh bread", "A beautiful beach", "Begin bravely"],
  },
  p: {
    label: "P",
    words: ["please", "paper", "purple", "practice", "people", "possible", "patience", "power"],
    phrases: ["Please pass the paper", "Purple pen", "Practice with patience", "Perfectly possible"],
  },
  t: {
    label: "T",
    words: ["table", "today", "together", "twenty", "travel", "trust", "time", "team"],
    phrases: ["Time to travel", "Trust the team", "Table for two", "Together today"],
  },
  d: {
    label: "D",
    words: ["door", "dream", "during", "decide", "distance", "daily", "direct", "downtown"],
    phrases: ["Dream big", "Decide the direction", "Daily practice", "Open the door"],
  },
  k: {
    label: "K / hard C",
    words: ["coffee", "carry", "class", "call", "count", "corner", "cost", "kind"],
    phrases: ["Call the corner cafe", "Count to ten", "A kind classmate", "Carry the cups"],
  },
  g: {
    label: "G",
    words: ["good", "green", "great", "group", "again", "gather", "guide", "goal"],
    phrases: ["Good goal", "Green garden", "Gather the group", "A great guide"],
  },
  s: {
    label: "S",
    words: ["sun", "seven", "simple", "sorry", "second", "sentence", "certain", "swim"],
    phrases: ["Seven simple steps", "A certain sentence", "See the sun", "So sorry"],
  },
  m: {
    label: "M",
    words: ["morning", "maybe", "moment", "myself", "music", "meeting", "modern", "many"],
    phrases: ["Good morning", "Maybe a moment", "Modern music", "Meeting myself"],
  },
};

// Reading aloud is much easier than making it up as you go, so it's the on-ramp.
// The passages get a little longer each step.
export const READING_PASSAGES: { level: number; text: string }[] = [
  { level: 1, text: "The morning is calm. I take a slow breath. I begin gently." },
  { level: 2, text: "There is no rush today. Each word can start softly, on a little cushion of air. I let my voice ease in." },
  {
    level: 3,
    text: "Speaking is not a race. When I slow down, my words have room to breathe. If I pause, that pause is mine to take. A pause is not a failure — it is a choice.",
  },
  {
    level: 4,
    text: "Some days feel easier than others, and that is completely normal. What matters is not that every word flows perfectly, but that I keep showing up. Progress is built from small, kind, repeated moments of practice — not from any single perfect day.",
  },
];

// The cue shown during word practice.
export const EASY_ONSET_CUE =
  "Start each word softly — like a quiet sigh sliding into the sound. Air first, then voice.";

// Open, low-stakes things to talk about. We pick one a day so the free-speech
// step isn't a blank "say anything" every time.
export const SPEAKING_PROMPTS: string[] = [
  "Describe your morning so far, in as much or as little detail as you like.",
  "Talk about a small thing you're looking forward to this week.",
  "Describe a place you find calming, as if showing someone around it.",
  "Talk through what you'd cook if a friend came over tonight.",
  "Describe a song or film you've enjoyed recently, and why.",
  "Talk about something you're good at — no modesty required.",
  "Describe your ideal slow Sunday from start to finish.",
  "Talk about a person who's been kind to you lately.",
  "Describe the last thing that made you laugh.",
  "Talk about a place you'd like to travel to, and what you'd do first.",
  "Describe your desk or the room you're in right now.",
  "Talk about a small win you had today, however tiny.",
];

// One-liners for the home screen. About effort and self-kindness, never about
// how fluent you were.
export const DAILY_AFFIRMATIONS: string[] = [
  "A pause is a choice, not a failure.",
  "Showing up today is the whole win.",
  "Your voice is worth hearing, blocks and all.",
  "Slow is a tool, not a flaw.",
  "You get to take up space when you speak.",
  "Courage is speaking anyway — you have it.",
  "Progress is small, kind, and repeated.",
  "Bad speech days are allowed. They don't erase anything.",
  "You are becoming someone who practices.",
  "Breathe first. The words can wait for the air.",
];

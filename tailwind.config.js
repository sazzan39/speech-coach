/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Muted teals and a warm accent — kept away from loud reds on purpose.
        ink: "#1c2530",
        mist: "#f4f7fb",
        calm: {
          50: "#eef6f6",
          100: "#d6ebeb",
          200: "#aed7d8",
          300: "#7dbdbf",
          400: "#4f9ea1",
          500: "#357f83",
          600: "#296567",
          700: "#234f51",
          800: "#1f4042",
          900: "#1c3536",
        },
        warmth: {
          400: "#e8a87c",
          500: "#e0915c",
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        "breathe-in": { "0%": { transform: "scale(0.7)" }, "100%": { transform: "scale(1.15)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

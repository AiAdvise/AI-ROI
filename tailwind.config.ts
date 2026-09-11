import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1c2434",
        "ink-soft": "#3d465a",
        paper: "#faf8f4",
        "paper-raised": "#ffffff",
        line: "#e4e0d7",
        accent: "#b3541e",
        "accent-soft": "#fdf1e7",
        severe: "#9f2b1f",
        "severe-soft": "#fbebe9",
        caution: "#95610f",
        "caution-soft": "#fbf1e0",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

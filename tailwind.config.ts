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
        good: "#3f6b4a",
        "good-soft": "#eaf2ec",
        // Decorative-only gradient accents for the app chrome (headers, hero
        // text, buttons, backgrounds). Never used to signal status - good/
        // caution/severe stay the only colors that carry meaning.
        "brand-a": "#e2611f",
        "brand-b": "#d3348e",
        "brand-c": "#7c3aed",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatBlob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -4%) scale(1.06)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        floatBlob: "floatBlob 14s ease-in-out infinite",
        floatBlobSlow: "floatBlob 20s ease-in-out infinite reverse",
      },
    },
  },
  plugins: [],
};

export default config;

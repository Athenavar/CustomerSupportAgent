import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#EEF2F6",
        surface: "#FFFFFF",
        "surface-raised": "#F7F9FB",
        border: "#DCE3EA",
        ink: {
          DEFAULT: "#16202B",
          soft: "#55636F",
          faint: "#8A97A3",
        },
        accent: {
          DEFAULT: "#1C6E63",
          bright: "#2F8F82",
          soft: "#E3F1EE",
        },
        warn: {
          DEFAULT: "#B4770A",
          soft: "#FBEFDA",
        },
        danger: {
          DEFAULT: "#C4372F",
          soft: "#FBE9E7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(22, 32, 43, 0.04), 0 8px 24px -12px rgba(22, 32, 43, 0.12)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 -40px" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        rise: "rise 0.25s ease-out",
        scan: "scan 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

// VerdictBoard visual system v1. Lime marks navigation, actions and selection —
// never a political side. Status colours are consistent everywhere.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0B0C0E",
        panel: "#15181B",
        panel2: "#1C2024",
        line: "#2A2F35",
        ink: "#E8EAED",
        muted: "#9AA1AB",
        accent: "#B8F36B",
        agreed: "#91CFA0",
        disputed: "#E6C27A",
        unverified: "#B7BDC6",
        danger: "#F08A7E",
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', '"Arial Narrow"', "sans-serif"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [],
};

export default config;

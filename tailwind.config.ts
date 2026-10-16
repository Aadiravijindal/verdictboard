import type { Config } from "tailwindcss";

// VerdictBoard visual system v2 — clean fintech-grade UI: light surfaces,
// dark gradient hero bands, tight geometric type, pill controls, large radii.
// Blue marks actions and selection only — never a political side.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        surface: "#F4F5F7",
        panel: "#FFFFFF",
        panel2: "#F7F8FA",
        line: "#E7E8EC",
        ink: "#0A0B0D",
        muted: "#6A6F7A",
        accent: "#0666EB",
        "accent-soft": "#EAF2FF",
        night: "#08090C",
        "night-2": "#14161C",
        agreed: "#0F8A4A",
        "agreed-soft": "#E7F6EE",
        disputed: "#B45F06",
        "disputed-soft": "#FFF3E2",
        unverified: "#5B6170",
        "unverified-soft": "#EEF0F3",
        danger: "#D92D20",
      },
      fontFamily: {
        display: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { xl2: "20px", xl3: "28px" },
      boxShadow: {
        card: "0 1px 2px rgba(10,11,13,0.04), 0 8px 24px rgba(10,11,13,0.06)",
        lift: "0 2px 4px rgba(10,11,13,0.06), 0 18px 48px rgba(10,11,13,0.12)",
      },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [],
};

export default config;

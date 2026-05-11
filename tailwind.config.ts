import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#07090c",
        "bg-1": "#0b0e13",
        "bg-2": "#0f131a",
        "bg-3": "#141923",
        line: "#1d2433",
        "line-2": "#262f44",
        "line-3": "#2f3a52",
        text: "#e7ecf3",
        "text-2": "#a8b3c4",
        "text-3": "#6f7d92",
        "text-4": "#4a5567",
        cyan: "#00f5d4",
        amber: "#f5b400",
        rose: "#f04060",
        green: "#3ad07c",
        violet: "#a07cff"
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace']
      },
      fontSize: {
        eyebrow: ["11px", { lineHeight: "14px", letterSpacing: "0.18em" }],
        mono: ["12px", { lineHeight: "16px" }],
        ui: ["13px", { lineHeight: "18px" }]
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px"
      },
      spacing: {
        sidebar: "220px",
        topbar: "48px"
      }
    }
  },
  plugins: []
};

export default config;

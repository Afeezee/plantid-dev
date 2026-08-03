import type { Config } from "tailwindcss";

// Design direction: "field journal / herbarium ledger" — botanical dark by
// default with a full parchment-paper light mode. Semantic tokens map to
// CSS variables (see globals.css) so both palettes stay consistent and
// alpha modifiers keep working via <alpha-value>.
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
        },
        parchment: {
          100: "rgb(var(--parchment-100) / <alpha-value>)",
          200: "rgb(var(--parchment-200) / <alpha-value>)",
        },
        moss: {
          300: "rgb(var(--moss-300) / <alpha-value>)",
          400: "rgb(var(--moss-400) / <alpha-value>)",
          500: "rgb(var(--moss-500) / <alpha-value>)",
          600: "rgb(var(--moss-600) / <alpha-value>)",
          700: "rgb(var(--moss-700) / <alpha-value>)",
        },
        ochre: {
          300: "rgb(var(--ochre-300) / <alpha-value>)",
          400: "rgb(var(--ochre-400) / <alpha-value>)",
          500: "rgb(var(--ochre-500) / <alpha-value>)",
          600: "rgb(var(--ochre-600) / <alpha-value>)",
        },
        rust: {
          400: "rgb(var(--rust-400) / <alpha-value>)",
          500: "rgb(var(--rust-500) / <alpha-value>)",
          600: "rgb(var(--rust-600) / <alpha-value>)",
        },
        // Always-dark text for high-contrast buttons on ochre/moss surfaces —
        // does not flip with theme.
        stamp: "rgb(24 21 15 / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        label: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift": {
          "0%,100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "50%": { transform: "translate3d(6px,-4px,0) rotate(0.5deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "drift": "drift 9s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

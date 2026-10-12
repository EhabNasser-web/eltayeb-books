import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--paper)",
          deep: "var(--paper-deep)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          deep: "var(--primary-deep)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          deep: "var(--accent-deep)",
        },
        line: "var(--line)",
        muted: "var(--muted)",
        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        // خطوط المقارنة في /styleguide فقط
        amiri: ["var(--font-amiri)", "serif"],
        ruqaa: ["var(--font-ruqaa)", "serif"],
        kufi: ["var(--font-kufi)", "serif"],
      },
      borderRadius: {
        book: "4px",
      },
    },
  },
  plugins: [],
};

export default config;

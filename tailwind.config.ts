import type { Config } from "tailwindcss";

/**
 * We intersect Tailwind's Config with a custom shape that includes `daisyui`
 * so TypeScript doesn't complain about the extra field.
 */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      // your custom tokens here (colors, spacing, etc.)
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          primary: "#4f46e5",
          "primary-content": "#ffffff",
          secondary: "#22c55e",
          accent: "#06b6d4",
          neutral: "#0f172a",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#eef2f7",
          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      "dark",
    ],
  },
} satisfies Config & { daisyui: unknown };

export default config;

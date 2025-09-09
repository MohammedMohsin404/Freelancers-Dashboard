import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class", '[data-theme="dark"]'], // supports both .dark and data-theme="dark"
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // your custom tokens can go here if needed
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    /**
     * IMPORTANT:
     * - Do NOT import from "daisyui/src/...".
     * - Keep theme objects flat here.
     */
    themes: [
      {
        light: {
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
      {
        dark: {
          primary: "#4f46e5",
          "primary-content": "#ffffff",

          secondary: "#22c55e",
          accent: "#06b6d4",
          neutral: "#0f172a",

          // darker bases for comfortable contrast
          "base-100": "#0b1120", // main surface
          "base-200": "#0a0f1a",
          "base-300": "#0a1222",

          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: "dark",
  },
} satisfies Config & { daisyui: unknown };

export default config;

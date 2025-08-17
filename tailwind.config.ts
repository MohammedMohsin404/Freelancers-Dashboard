import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#4F46E5",
          "secondary": "#6366F1",
          "accent": "#4F46E5",
          "neutral": "#111827",
          "base-100": "#F5F5F5", // background
          "base-200": "#FFFFFF", // card
          "base-content": "#111827", // text
          "success": "#22C55E",
          "warning": "#FACC15",
          "error": "#EF4444",
        },
      },
      {
        dark: {
          "primary": "#6366F1",
          "secondary": "#4F46E5",
          "accent": "#6366F1",
          "neutral": "#F9FAFB",
          "base-100": "#1F2937", // background
          "base-200": "#111827", // card
          "base-content": "#F9FAFB", // text
          "success": "#22C55E",
          "warning": "#FACC15",
          "error": "#EF4444",
        },
      },
    ],
  },
};

export default config;

import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // your custom tokens here if you want
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    /**
     * IMPORTANT: Do NOT import from "daisyui/src/...".
     * Define your custom theme directly here or use built-ins.
     */
    themes: [
      {
        light: {
          // Start from a clean custom theme (no spread from internals)
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
      "dark", // keep DaisyUI's built-in dark theme
    ],
  },
} satisfies Config & { daisyui: unknown };

export default config;

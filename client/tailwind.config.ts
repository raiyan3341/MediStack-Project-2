import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0a192f",
          dark: "#0f172a",
          blue: "#1e3a8a",
          lightBlue: "#3b82f6",
          teal: "#0d9488",
          tealLight: "#14b8a6",
          emerald: "#10b981",
          slate: "#f8fafc",
          border: "#e2e8f0"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;


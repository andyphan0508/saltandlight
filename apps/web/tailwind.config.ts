import type { Config } from "tailwindcss";
import { saltAndLightPreset } from "@saltandlight/ui/tailwind-preset";

const config: Config = {
  presets: [saltAndLightPreset as Config],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-patrick)", "Patrick Hand", "cursive", "sans-serif"],
        display: ["var(--font-patrick)", "Patrick Hand", "cursive", "sans-serif"],
        patrick: ["var(--font-patrick)", "Patrick Hand", "cursive", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

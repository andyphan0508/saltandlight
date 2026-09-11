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
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontWeight: {
        extrabold: "700",
        black: "700",
      },
    },
  },
  plugins: [],
};

export default config;

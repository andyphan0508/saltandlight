import type { Config } from "tailwindcss";
import { saltAndLightPreset } from "@saltandlight/ui/tailwind-preset";

const config: Config = {
  presets: [saltAndLightPreset as Config],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

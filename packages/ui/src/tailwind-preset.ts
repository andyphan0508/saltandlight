import type { Config } from "tailwindcss";

/**
 * Brand tokens for saltandlight.com.vn:
 * Sophisticated mint & sage accents, warm cream background, rich charcoal ink typography,
 * warm gold & terracotta badges, soft card elevations.
 */
export const saltAndLightPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8f8f7",
          100: "#f0f0ee",
          200: "#e2e2de",
          300: "#c4c4bc",
          400: "#99998e",
          500: "#717167",
          600: "#52524a",
          700: "#3d3d37",
          800: "#272723",
          900: "#18181b",
          DEFAULT: "#18181b",
        },
        mint: {
          50: "#f4f9f5",
          100: "#e6f2e8",
          200: "#d0e6d5",
          300: "#aed4b7",
          400: "#7fb98c",
          500: "#539c63",
          600: "#3d7d4b",
          700: "#2a5934",
          DEFAULT: "#e6f2e8",
        },
        cream: {
          50: "#fdfcfb",
          DEFAULT: "#faf9f6",
          100: "#f4f1ea",
          200: "#ede7dc",
        },
        sale: {
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
          light: "#fee2e2",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          DEFAULT: "#d97706",
        },
        brand: {
          new: "#1f5c3f",
          accent: "#164e63",
          forest: "#133e2b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "-apple-system", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 14px 30px -4px rgba(24, 24, 27, 0.08), 0 4px 12px -2px rgba(24, 24, 27, 0.04)",
        glow: "0 0 25px -5px rgba(31, 92, 63, 0.15)",
      },
    },
  },
};

export default saltAndLightPreset;

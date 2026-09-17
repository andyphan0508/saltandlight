import { foldVietnamese } from "./ward-search";

/** Admin-picked swatches: a 6-digit hex, the only shape the color picker emits. */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (value: string | null | undefined): value is string =>
  typeof value === "string" && HEX_COLOR_PATTERN.test(value);

/** sRGB channel → linear light, per WCAG 2.1 relative luminance. */
const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/**
 * Black or white text for a swatch, whichever WCAG contrasts better against it.
 * The 0.179 cut-off is where contrast against black and against white meet, so
 * mid-tones (mint, olive) land on the more readable side instead of guessing.
 */
export const textColorOn = (hex: string | null | undefined): "#111111" | "#FFFFFF" => {
  if (!isHexColor(hex)) return "#111111";
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16)));
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return luminance > 0.179 ? "#111111" : "#FFFFFF";
};

/** Ready-made shop palette for the admin color picker. */
export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Đen", hex: "#111111" },
  { name: "Kem", hex: "#F5EFE6" },
  { name: "Mint", hex: "#A8E6CF" },
  { name: "Xanh rêu", hex: "#2F5D50" },
  { name: "Xanh navy", hex: "#1F3A5F" },
  { name: "Xám", hex: "#9CA3AF" },
  { name: "Be", hex: "#D9C3A5" },
  { name: "Nâu", hex: "#6B4A2F" },
  { name: "Hồng pastel", hex: "#F7C6D0" },
  { name: "Vàng", hex: "#F4C542" },
  { name: "Đỏ đô", hex: "#8C1C2B" },
];

const PRESET_BY_NAME = new Map(COLOR_PRESETS.map((preset) => [foldVietnamese(preset.name), preset.hex]));
const NAME_ALIASES: Record<string, string> = { black: "#111111", white: "#FFFFFF", "trang kem": "#F5EFE6" };

/**
 * The colour a pill is painted with. Variants saved before the colour picker
 * have no hex, so fall back to the palette entry with the same name ("Trắng",
 * "den", "Xanh rêu"…), then to white — every pill renders the same way instead
 * of old variants getting a different look.
 */
export const swatchFor = (name: string | null | undefined, hex: string | null | undefined): string => {
  if (isHexColor(hex)) return hex.toUpperCase();
  const key = foldVietnamese(name ?? "");
  return PRESET_BY_NAME.get(key) ?? NAME_ALIASES[key] ?? "#FFFFFF";
};

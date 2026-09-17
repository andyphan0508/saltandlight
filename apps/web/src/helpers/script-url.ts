// Browsers ignore whitespace and control characters inside a scheme, so "java\tscript:" still runs.
const SCRIPT_SCHEME = /^(javascript|vbscript):|^data:(?!image\/)/;
const IGNORED_CHARS = /[\s\x00-\x1f]/g;

/**
 * Admin content ends up in storefront hrefs (CTA buttons, banners, social links), and
 * React 18 renders `javascript:` hrefs as-is. Returns the first string anywhere in
 * `value` that would run script when clicked, or null.
 */
export const findScriptUrl = (value: unknown): string | null => {
  if (typeof value === "string") {
    return SCRIPT_SCHEME.test(value.replace(IGNORED_CHARS, "").toLowerCase()) ? value : null;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) {
      const found = findScriptUrl(v);
      if (found) return found;
    }
  }
  return null;
};

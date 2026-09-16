const SIZE_PREFIX = /^SIZE\s+/;
const BABY_SUFFIX = /\(\s*BABY\s*\)/;
const FREE_SIZE = /^FREE\s*SIZE$/;
/** "3XL" → "XXXL", "2XS" → "XXS", so numeric and repeated-X spellings rank the same. */
const NUMERIC_X = /^(\d)X([SL])$/;
const CORE = /^(X*)([SML])$/;

/**
 * Position on the size scale: M = 0, each step out from it is ±1 (S/L = ±1,
 * XS/XL = ±2, XXS/XXL = ±3 …). Baby sizes sit a group below adult ones and
 * "Free size" above both; anything unrecognised returns null and sorts last.
 * Derived from the label instead of a hand-kept list, so a size nobody
 * thought of (XXS, 4XL) still lands in the right place.
 */
const sizeRank = (size: string): number | null => {
  const normalized = size.trim().toUpperCase().replace(SIZE_PREFIX, "");
  if (FREE_SIZE.test(normalized)) return 200;

  const isBaby = BABY_SUFFIX.test(normalized);
  const core = normalized
    .replace(BABY_SUFFIX, "")
    .trim()
    .replace(NUMERIC_X, (_, count: string, letter: string) => "X".repeat(Number(count)) + letter);

  const match = CORE.exec(core);
  if (!match) return null;
  const [, xs = "", letter] = match;
  if (letter === "M") return xs ? null : isBaby ? 0 : 100;

  const offset = (letter === "L" ? 1 : -1) * (xs.length + 1);
  return (isBaby ? 0 : 100) + offset;
};

/** Sorts sizes smallest → largest (baby sizes first); unknown sizes go last, alphabetically. */
export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const ar = sizeRank(a);
    const br = sizeRank(b);
    if (ar !== null && br !== null) return ar - br;
    if (ar !== null) return -1;
    if (br !== null) return 1;
    return a.localeCompare(b);
  });

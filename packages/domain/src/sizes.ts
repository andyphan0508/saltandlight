const SIZE_ORDER = [
  "XS (BABY)",
  "S (BABY)",
  "M (BABY)",
  "L (BABY)",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "XXL",
  "3XL",
  "FREE SIZE",
];

const sizeRank = (size: string) => SIZE_ORDER.indexOf(size.trim().toUpperCase().replace(/^SIZE\s+/, ""));

/** Sorts sizes smallest → largest (baby sizes first); unknown sizes go last, alphabetically. */
export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const ai = sizeRank(a);
    const bi = sizeRank(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

export interface CategorySelection {
  /** The breadcrumb / related-products / size-guide category. */
  primaryId: string | null;
  /** Every category the product is listed in, primary first, no duplicates. */
  categoryIds: string[];
}

/**
 * Keeps the two category fields consistent however the admin clicked: the
 * primary is always one of the listed categories, and a list with anything in
 * it always has a primary. Used by the form and re-applied by the API, so a
 * hand-crafted request can't list a product under nothing or orphan its primary.
 */
export const normalizeCategorySelection = (
  primaryId: string | null | undefined,
  categoryIds: readonly (string | null | undefined)[],
): CategorySelection => {
  const unique = Array.from(new Set(categoryIds.filter((id): id is string => Boolean(id))));
  if (primaryId && !unique.includes(primaryId)) unique.unshift(primaryId);
  const primary = primaryId || unique[0] || null;
  return {
    primaryId: primary,
    categoryIds: primary ? [primary, ...unique.filter((id) => id !== primary)] : [],
  };
};

/** Toggles one category in the selection; removing the primary promotes the next one. */
export const toggleCategory = (selection: CategorySelection, id: string): CategorySelection => {
  if (!selection.categoryIds.includes(id)) {
    return normalizeCategorySelection(selection.primaryId, [...selection.categoryIds, id]);
  }
  const remaining = selection.categoryIds.filter((c) => c !== id);
  return normalizeCategorySelection(selection.primaryId === id ? null : selection.primaryId, remaining);
};

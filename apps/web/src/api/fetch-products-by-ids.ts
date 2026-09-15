/** Loads product cards for a list of ids (wishlist, compare). */
export const fetchProductsByIds = async <T>(ids: string[]): Promise<T[]> => {
  const res = await fetch(`/api/products?ids=${ids.join(",")}`);
  const data = await res.json();
  return data.products ?? [];
};

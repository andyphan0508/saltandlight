import { invalidateMemoryCache } from "./memory-cache";

const PRODUCT_CACHE_KEYS = [
  "catalog-products-",
  "homepage-featured-products-",
  "product-detail-",
  "related-products-",
  "nav-categories-with-counts",
  "available-product-sizes",
];

/** Clears every storefront cache that shows product or category data, after an admin edit. */
export const invalidateProductCaches = () => PRODUCT_CACHE_KEYS.forEach((key) => invalidateMemoryCache(key));

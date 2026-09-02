/** The storefront's public URL — falls back to localhost so local dev keeps working without the env var set. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

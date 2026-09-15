/** The storefront's public URL — dynamically determines production URL vs localhost */
export const getStorefrontUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

export const SITE_URL = getStorefrontUrl();

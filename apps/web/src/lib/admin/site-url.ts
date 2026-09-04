/** The storefront's public URL — dynamically determines production URL vs localhost */
export function getStorefrontUrl(): string {
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1")) {
      return "https://saltandlight-web.vercel.app";
    }
  }
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://saltandlight-web.vercel.app";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export const SITE_URL = getStorefrontUrl();

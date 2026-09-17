/**
 * `?next=` comes from the URL, so it must stay on this site: a path like "/tai-khoan".
 * "//evil.com" and "/\evil.com" are protocol-relative to browsers, and "https://…" is
 * absolute — any of those would turn the login page into an open redirect for phishing.
 */
export const safeRedirectPath = (value: string | null | undefined, fallback: string) =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;

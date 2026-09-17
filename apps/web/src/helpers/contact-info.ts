import { normalizeVietnamesePhone } from "./phone";
import type { FooterSocialLink, SiteSettingsData } from "@/interfaces/site-settings";

export type ContactSource = Pick<SiteSettingsData, "footerPhone" | "footerEmail" | "footerAddress" | "footerSocialLinks">;

export interface ContactInfo {
  /** As the admin typed it, for display: "0847 25 2025". */
  phone: string;
  telHref: string;
  zaloHref: string;
  /** True when the admin set a Zalo link/number instead of reusing the hotline. */
  hasCustomZalo: boolean;
  email: string;
  mailHref: string;
  address: string;
}

const isZalo = (link: FooterSocialLink) => link.platform.trim().toLowerCase() === "zalo";

/** The Zalo entry lives in the social links list, which is also what the footer renders. */
export const findZaloLink = (links: FooterSocialLink[]) => links.find(isZalo)?.url.trim() ?? "";

/** Writes (or removes, when blank) the single Zalo entry without touching the other social links. */
export const withZaloLink = (links: FooterSocialLink[], value: string): FooterSocialLink[] => {
  const rest = links.filter((link) => !isZalo(link));
  const trimmed = value.trim();
  return trimmed ? [...rest, { platform: "Zalo", url: trimmed }] : rest;
};

/**
 * Accepts what an admin naturally pastes into a Zalo field — a full link, a
 * "zalo.me/…" without scheme, or just a phone number — and returns a link.
 */
const toZaloHref = (value: string, fallbackPhone: string | null) => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^zalo\.me\//i.test(trimmed)) return `https://${trimmed}`;
  const phone = normalizeVietnamesePhone(trimmed) ?? fallbackPhone;
  return phone ? `https://zalo.me/${phone}` : "";
};

/**
 * Every hotline / Zalo / email link on the site comes from here, so changing
 * the number in admin changes the FAB, header, footer, contact page and order
 * pages together instead of leaving stale copies behind.
 */
export const resolveContactInfo = (source: ContactSource): ContactInfo => {
  const localPhone = normalizeVietnamesePhone(source.footerPhone);
  const customZalo = findZaloLink(source.footerSocialLinks ?? []);

  return {
    phone: source.footerPhone,
    telHref: localPhone ? `tel:${localPhone}` : "",
    zaloHref: toZaloHref(customZalo, localPhone),
    hasCustomZalo: Boolean(customZalo),
    email: source.footerEmail,
    mailHref: source.footerEmail ? `mailto:${source.footerEmail}` : "",
    address: source.footerAddress,
  };
};

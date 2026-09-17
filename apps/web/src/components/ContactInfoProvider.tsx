"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveContactInfo, type ContactInfo } from "@/helpers/contact-info";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/interfaces/site-settings";

const ContactInfoContext = createContext<ContactInfo>(resolveContactInfo(DEFAULT_SITE_SETTINGS));

/** Resolved once in the storefront layout; every hotline / Zalo / email on the page reads it from here. */
export const ContactInfoProvider = ({ siteSettings, children }: { siteSettings: SiteSettingsData; children: ReactNode }) => (
  <ContactInfoContext.Provider value={resolveContactInfo(siteSettings)}>{children}</ContactInfoContext.Provider>
);

export const useContactInfo = () => useContext(ContactInfoContext);

/** Hotline as a tap-to-call link. Usable from server components, unlike the hook. */
export const HotlineLink = ({ className }: { className?: string }) => {
  const { phone, telHref } = useContactInfo();
  return telHref ? (
    <a href={telHref} className={className}>
      {phone}
    </a>
  ) : (
    <span className={className}>{phone}</span>
  );
};

export const EmailLink = ({ className }: { className?: string }) => {
  const { email, mailHref } = useContactInfo();
  return (
    <a href={mailHref} className={className}>
      {email}
    </a>
  );
};

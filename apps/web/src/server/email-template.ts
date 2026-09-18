import { prisma } from "@saltandlight/db";
import {
  DEFAULT_ORDER_EMAIL,
  ORDER_EMAIL_ID,
  type OrderEmailTemplate,
} from "@/helpers/order-email";
import { getCachedSiteSettings } from "@/server/queries";
import { withMemoryCache } from "@/server/memory-cache";

export const ORDER_EMAIL_CACHE_KEY = "order-email-template";

/**
 * The saved order email, or the built-in one when nothing is saved yet — or when
 * the table can't be read (e.g. its migration hasn't run): an order must never
 * lose its confirmation email over the template.
 */
export const getOrderEmailTemplate = (): Promise<OrderEmailTemplate> =>
  withMemoryCache(ORDER_EMAIL_CACHE_KEY, 60, async () => {
    try {
      const row = await prisma.emailTemplate.findUnique({
        where: { id: ORDER_EMAIL_ID },
      });
      if (!row) return DEFAULT_ORDER_EMAIL;
      const { id: _id, updatedAt: _updatedAt, ...template } = row;
      return template;
    } catch (err) {
      console.error(
        "[email-template] falling back to the default order email:",
        err,
      );
      return DEFAULT_ORDER_EMAIL;
    }
  });

/** The shop logo as an absolute URL, since an email has no page origin to resolve "/images/…" against. */
export const getEmailLogoUrl = async (siteUrl: string) => {
  const settings = await getCachedSiteSettings().catch(() => null);
  const logo = settings?.logoUrl || "/images/logo.png";
  return logo.startsWith("/") ? `${siteUrl}${logo}` : logo;
};

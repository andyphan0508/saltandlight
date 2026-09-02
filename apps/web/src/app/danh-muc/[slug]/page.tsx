import { redirect } from "next/navigation";

/**
 * Category browsing now lives entirely on /san-pham (sidebar filter +
 * sort + pagination) — this route just forwards old/shared category links
 * there instead of maintaining a second, simpler product-grid page.
 */
export default function CategoryRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`/san-pham?categories=${params.slug}`);
}

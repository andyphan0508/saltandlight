import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ArrowRight } from "@/components/Icons";
import { ProductGrid } from "@/components/ProductGrid";
import { getCachedFeaturedProducts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export interface FeaturedProductsContent {
  eyebrow?: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  count?: number;
}

export async function FeaturedProductsBlock({ content }: { content: FeaturedProductsContent }) {
  const count = content.count ?? 8;
  let products: any[] = [];
  try {
    const data = await getCachedFeaturedProducts(count);
    products = toPlain(data).products;
  } catch (err) {
    console.error("FeaturedProductsBlock fetch error:", err);
  }

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          {content.eyebrow && (
            <span className="text-xs font-black uppercase tracking-widest text-brand-forest">{content.eyebrow}</span>
          )}
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase text-ink">{content.headline}</h2>
        </div>
        <Link href={content.ctaHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <span>{content.ctaLabel}</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      <ProductGrid products={products.slice(0, count)} />
    </section>
  );
}

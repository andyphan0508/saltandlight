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
    <section className="mx-auto max-w-7xl px-4 animate-slide-up-fade">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          {content.eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-forest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {content.eyebrow}
            </span>
          )}
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase text-ink">{content.headline}</h2>
        </div>
        <Link href={content.ctaHref}>
          <Button variant="outline" size="sm" className="gap-2 active-press hover:bg-mint-50">
            <span>{content.ctaLabel}</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      <ProductGrid products={products.slice(0, count)} />
    </section>
  );
}

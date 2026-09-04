import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ArrowRight } from "@/components/Icons";
import { BlockIcon } from "./icon-map";

export interface PromoCtaContent {
  badge?: string;
  icon?: string;
  headline: string;
  body: string;
  bullets?: string[];
  ctaLabel: string;
  ctaHref: string;
}

export function PromoCtaBlock({ content }: { content: PromoCtaContent }) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid gap-8 rounded-3xl bg-white p-8 sm:p-12 shadow-card border border-ink/5 lg:grid-cols-12 items-center">
        <div className="space-y-4 lg:col-span-8">
          {content.badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3.5 py-1 text-xs font-bold uppercase text-brand-forest">
              <BlockIcon name={content.icon} size={14} />
              {content.badge}
            </span>
          )}
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink">{content.headline}</h2>
          <p className="text-sm text-ink/75 leading-relaxed max-w-2xl">{content.body}</p>
          {content.bullets && content.bullets.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-ink/70">
              {content.bullets.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  ✓ {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-4 flex justify-start lg:justify-end">
          <Link href={content.ctaHref}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
              {content.ctaLabel}
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

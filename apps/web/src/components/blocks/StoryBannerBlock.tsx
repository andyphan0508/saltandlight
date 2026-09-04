import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { BlockIcon } from "./icon-map";

export interface StoryBannerContent {
  icon?: string;
  quote: string;
  quoteRef?: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function StoryBannerBlock({ content }: { content: StoryBannerContent }) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-forest to-brand-new p-8 sm:p-14 text-white shadow-xl">
        <div className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-mint-200">
            <BlockIcon name={content.icon} size={24} />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">
            &ldquo;{content.quote}&rdquo;
          </h2>

          {content.quoteRef && (
            <p className="text-xs font-bold tracking-widest text-mint-200 uppercase">— {content.quoteRef}</p>
          )}

          <p className="text-sm sm:text-base text-white/85 leading-relaxed font-light">{content.body}</p>

          {content.ctaLabel && content.ctaHref && (
            <div className="pt-2">
              <Link href={content.ctaHref}>
                <Button variant="secondary" size="md" className="bg-white text-ink hover:bg-mint-100 font-bold">
                  {content.ctaLabel}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

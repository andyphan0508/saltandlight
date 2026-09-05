import { Star } from "@/components/Icons";

interface TestimonialItem {
  name: string;
  role?: string;
  rating: number;
  product?: string;
  comment: string;
}

export interface TestimonialsContent {
  eyebrow?: string;
  headline: string;
  items: TestimonialItem[];
}

export function TestimonialsBlock({ content }: { content: TestimonialsContent }) {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="text-center max-w-2xl mx-auto mb-10">
        {content.eyebrow && (
          <span className="text-xs font-black uppercase tracking-widest text-brand-forest">{content.eyebrow}</span>
        )}
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-black uppercase text-ink">{content.headline}</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {content.items.map((rev, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-7 shadow-card border border-ink/5 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-1 text-gold-500 mb-4">
                {Array.from({ length: rev.rating }).map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-ink/80 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
            </div>

            <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-ink">{rev.name}</h4>
                {rev.role && <p className="text-[11px] text-ink/50">{rev.role}</p>}
              </div>
              {rev.product && (
                <span className="rounded-full bg-mint-100 px-2.5 py-1 text-[10px] font-bold text-brand-forest">
                  Đã mua {rev.product}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

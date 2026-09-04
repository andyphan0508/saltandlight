import { BlockIcon } from "./icon-map";

interface FeatureItem {
  icon?: string;
  number?: string;
  title: string;
  description: string;
}

export interface FeatureCardsContent {
  style?: "row" | "card" | "numbered";
  headline?: string;
  subtitle?: string;
  items: FeatureItem[];
}

export function FeatureCardsBlock({ content }: { content: FeatureCardsContent }) {
  const style = content.style || "row";

  if (style === "row") {
    return (
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
                <BlockIcon name={item.icon} size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-ink uppercase tracking-wide">{item.title}</h4>
                <p className="mt-1 text-xs text-ink/65 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (style === "numbered") {
    return (
      <div className="rounded-3xl bg-mint-50 p-8 sm:p-12 border border-mint-200/80 space-y-8">
        {(content.headline || content.subtitle) && (
          <div className="text-center max-w-xl mx-auto">
            {content.headline && (
              <h2 className="font-display text-2xl font-black uppercase text-ink">{content.headline}</h2>
            )}
            {content.subtitle && <p className="text-xs text-ink/65 mt-1">{content.subtitle}</p>}
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-3 text-center sm:text-left">
          {content.items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-ink/5 space-y-2">
              {item.number && <span className="font-display text-2xl font-black text-brand-forest">{item.number}</span>}
              <h3 className="font-bold text-sm uppercase text-ink">{item.title}</h3>
              <p className="text-xs text-ink/70 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // "card"
  return (
    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {content.items.map((item, i) => (
        <div key={i} className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-3 sm:space-y-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <BlockIcon name={item.icon} size={20} />
          </div>
          <h3 className="font-bold text-sm uppercase text-ink sm:font-display sm:text-xl sm:normal-case">{item.title}</h3>
          <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

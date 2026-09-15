import { Check } from "./Icons";
import type { ProductGuide, ProductGuideItem } from "@/helpers/product-guides";

/** Category-level guides (care, size chart, highlights…) shown under a product's description. */
export const ProductGuides = ({ guides }: { guides: ProductGuide[] }) => {
  if (guides.length === 0) return null;
  return (
    <div className="space-y-8">
      {guides.map((guide) => (
        <ProductGuideSection key={guide.id} guide={guide} />
      ))}
    </div>
  );
};

export const ProductGuideSection = ({ guide }: { guide: ProductGuide }) => {
  if (guide.items.length === 0) return null;

  return (
    <section className="space-y-3 text-xs sm:text-sm text-ink/85 leading-relaxed">
      <header>
        <h3 className="font-display text-base sm:text-lg font-bold text-ink uppercase tracking-wider border-b border-ink/10 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-forest" />
          <span>{guide.title}</span>
        </h3>
        {guide.subtitle && <p className="mt-2 text-xs text-ink/60">{guide.subtitle}</p>}
      </header>
      {guide.layout === "cards" && <GuideCards items={guide.items} />}
      {guide.layout === "list" && <GuideList items={guide.items} />}
      {guide.layout === "table" && <GuideTable items={guide.items} />}
    </section>
  );
};

const GuideCards = ({ items }: { items: ProductGuideItem[] }) => {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-ink/5 shadow-2xs">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100/70 text-xl">
            {item.icon || "✨"}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {item.title && (
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wide">{item.title}</h4>
            )}
            {item.content && <p className="text-xs text-ink/75 leading-relaxed whitespace-pre-line">{item.content}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

const GuideList = ({ items }: { items: ProductGuideItem[] }) => {
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-brand-forest flex-shrink-0 mt-0.5">
            <Check size={12} />
          </span>
          <span className="leading-relaxed text-ink/80">{item.content || item.title}</span>
        </li>
      ))}
    </ul>
  );
};

export const GuideTable = ({ items }: { items: ProductGuideItem[] }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-xs bg-white">
      <table className="w-full text-left text-xs sm:text-sm">
        <tbody className="divide-y divide-ink/5">
          {items.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              <td className="py-2.5 px-4 font-bold text-ink/70 w-1/3 sm:w-1/4 border-r border-ink/5">{item.title}</td>
              <td className="py-2.5 px-4 font-medium text-ink">{item.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

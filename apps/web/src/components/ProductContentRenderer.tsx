import Image from "next/image";
import { Check, Sparkles, Heart, CrossIcon, Gift, Truck, ShieldCheck, Star } from "./Icons";
import {
  parseProductContent,
  type ProductContentBlock,
} from "@/lib/product-content";

interface ProductContentRendererProps {
  content?: string | null;
}

const renderCalloutIcon = (iconName: string) => {
  switch (iconName) {
    case "Sparkles":
      return <Sparkles size={20} className="text-brand-forest" />;
    case "Heart":
      return <Heart size={20} className="text-rose-500" />;
    case "Gift":
      return <Gift size={20} className="text-amber-600" />;
    case "Truck":
      return <Truck size={20} className="text-blue-600" />;
    case "ShieldCheck":
      return <ShieldCheck size={20} className="text-emerald-600" />;
    case "Star":
      return <Star size={20} className="text-amber-500" />;
    case "CrossIcon":
      return <CrossIcon size={20} className="text-brand-forest" />;
    default:
      return iconName || "💡";
  }
};

interface BlockItemProps {
  block: ProductContentBlock;
}

const BlockItem = ({ block }: BlockItemProps) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="whitespace-pre-line leading-relaxed text-ink/80">
          {block.content}
        </p>
      );

    case "heading":
      if (block.level === 3) {
        return (
          <h4 className="font-display text-sm sm:text-base font-bold text-ink uppercase tracking-wide mt-4 mb-1">
            {block.text}
          </h4>
        );
      }
      return (
        <h3 className="font-display text-base sm:text-lg font-bold text-ink uppercase tracking-wider mt-6 mb-2 border-b border-ink/10 pb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-forest" />
          <span>{block.text}</span>
        </h3>
      );

    case "bullet_list":
      return (
        <ul className="space-y-2 my-2.5">
          {block.items.filter(Boolean).map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-brand-forest flex-shrink-0 mt-0.5">
                <Check size={12} />
              </span>
              <span className="leading-relaxed text-ink/80">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "callout": {
      const variantClasses = {
        mint: "bg-mint-50/80 border-mint-200 text-brand-forest",
        amber: "bg-amber-50/80 border-amber-200 text-amber-900",
        blue: "bg-blue-50/80 border-blue-200 text-blue-900",
      }[block.variant || "mint"];

      return (
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs my-3 ${variantClasses}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {renderCalloutIcon(block.icon)}
            </span>
            <div>
              {block.title && (
                <h5 className="font-bold text-sm text-ink mb-1">
                  {block.title}
                </h5>
              )}
              <p className="text-xs sm:text-sm text-ink/80 whitespace-pre-line leading-relaxed">
                {block.body}
              </p>
            </div>
          </div>
        </div>
      );
    }

    case "quote":
      return (
        <div className="rounded-2xl bg-cream p-4 sm:p-5 border border-ink/10 my-3 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest text-white flex-shrink-0 mt-0.5 shadow-xs">
              <CrossIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <blockquote className="italic font-serif text-sm sm:text-base text-ink leading-relaxed">
                &ldquo;{block.quote}&rdquo;
              </blockquote>
              {block.quoteRef && (
                <cite className="block mt-2 text-xs font-bold text-brand-forest not-italic">
                  — {block.quoteRef}
                </cite>
              )}
            </div>
          </div>
        </div>
      );

    case "specs_table":
      return (
        <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-xs my-3 bg-white">
          <table className="w-full text-left text-xs sm:text-sm">
            <tbody className="divide-y divide-ink/5">
              {block.rows
                .filter((r) => r.label && r.value)
                .map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-2.5 px-4 font-bold text-ink/70 w-1/3 sm:w-1/4 border-r border-ink/5">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-ink">
                      {row.value}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      return (
        <div className="my-4 space-y-1.5">
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 border border-ink/10 shadow-xs">
            <Image
              src={block.url}
              alt={block.caption || "Hình ảnh chi tiết sản phẩm"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
          {block.caption && (
            <p className="text-center text-[11px] text-ink/50 italic">
              {block.caption}
            </p>
          )}
        </div>
      );

    case "price_note":
      return null;

    default:
      return null;
  }
};

export const ProductContentRenderer = ({
  content,
}: ProductContentRendererProps) => {
  if (!content) return null;

  const rawBlocks = parseProductContent(content);
  // Filter out legacy hardcoded care blocks now handled uniformly by Global Care Guide
  const blocks = rawBlocks.filter((b) => {
    if (b.id && b.id.includes("default-care-")) return false;
    if (b.type === "heading" && /hướng dẫn bảo quản|hướng dẫn giặt/i.test(b.text)) return false;
    if (b.type === "callout" && /giặt áo|phơi & ủi|phơi áo/i.test(b.title)) return false;
    return true;
  });

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4 text-xs sm:text-sm text-ink/85 leading-relaxed">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
};

import Image from "next/image";
import { Check, CrossIcon } from "./Icons";
import type { ProductContentBlock } from "@/helpers/product-content";

/** Renders a product's own description blocks. Category guides render separately (ProductGuides). */
export const ProductContentRenderer = ({ blocks }: { blocks: ProductContentBlock[] }) => {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4 text-xs sm:text-sm text-ink/85 leading-relaxed">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
};

const BlockItem = ({ block }: { block: ProductContentBlock }) => {
  switch (block.type) {
    case "paragraph":
      return <p className="whitespace-pre-line leading-relaxed text-ink/80">{block.content}</p>;

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

    case "quote":
      return (
        <div className="rounded-2xl bg-cream p-4 sm:p-5 border border-ink/10 my-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest text-white flex-shrink-0 mt-0.5 shadow-xs">
              <CrossIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <blockquote className="italic font-serif text-sm sm:text-base text-ink leading-relaxed">
                &ldquo;{block.quote}&rdquo;
              </blockquote>
              {block.quoteRef && (
                <cite className="block mt-2 text-xs font-bold text-brand-forest not-italic">— {block.quoteRef}</cite>
              )}
            </div>
          </div>
        </div>
      );

    case "image":
      if (!block.url) return null;
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
          {block.caption && <p className="text-center text-[11px] text-ink/50 italic">{block.caption}</p>}
        </div>
      );

    default:
      return null;
  }
};

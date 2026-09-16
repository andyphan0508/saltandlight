import type { ProductBlockLayout } from "@/helpers/product-block-layout";

const CARD = "rounded-[2px] bg-slate-300";
const IMAGE = "rounded-[2px] bg-brand-forest/70";

/** Tiny wireframe of a layout preset — the admin picks by shape, not by reading a label. */
export const LayoutThumbnail = ({ layout, isSelected }: { layout: ProductBlockLayout; isSelected: boolean }) => (
  <div
    aria-hidden="true"
    className={`h-14 w-full rounded-lg border p-1.5 transition-colors ${
      isSelected ? "border-brand-forest/30 bg-mint-50/60" : "border-slate-200 bg-slate-50"
    }`}
  >
    {layout === "grid" && (
      <div className="grid h-full grid-cols-4 grid-rows-2 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={CARD} />
        ))}
      </div>
    )}

    {layout === "slider" && (
      <div className="flex h-full items-stretch gap-1 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${CARD} w-1/4 flex-shrink-0`} />
        ))}
        <div className={`${CARD} w-1/4 flex-shrink-0 opacity-40`} />
      </div>
    )}

    {layout === "banner-top" && (
      <div className="flex h-full flex-col gap-1">
        <div className={`${IMAGE} h-1/2`} />
        <div className="grid flex-1 grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={CARD} />
          ))}
        </div>
      </div>
    )}

    {layout === "image-left" && (
      <div className="flex h-full gap-1 overflow-hidden">
        <div className={`${IMAGE} w-1/3 flex-shrink-0`} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${CARD} w-1/5 flex-shrink-0`} />
        ))}
        <div className={`${CARD} w-1/5 flex-shrink-0 opacity-40`} />
      </div>
    )}
  </div>
);

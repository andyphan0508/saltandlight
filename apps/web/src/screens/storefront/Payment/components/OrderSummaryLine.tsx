import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { isHexColor } from "@/helpers/color";
import type { CheckoutQuoteLine } from "@/interfaces/checkout";

/** One cart line as the customer is about to pay for it: photo, colour, size, quantity and price. */
export const OrderSummaryLine = ({ line }: { line: CheckoutQuoteLine }) => (
  <div className="flex gap-3 py-3">
    <Link
      href={`/san-pham/${line.slug}`}
      className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-mint-50"
    >
      {line.image ? (
        <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center text-[9px] font-bold text-ink/30">S&amp;L</span>
      )}
      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-ink px-1 text-[10px] font-bold text-white">
        {line.quantity}
      </span>
    </Link>

    <div className="min-w-0 flex-1 text-xs">
      <p className="line-clamp-2 font-bold text-ink leading-snug">{line.name}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {line.color && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink/80">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-ink/20"
              style={{ backgroundColor: isHexColor(line.colorHex) ? line.colorHex : /đen|black/i.test(line.color) ? "#111111" : "#FFFFFF" }}
            />
            Màu: {line.color}
          </span>
        )}
        {line.size && (
          <span className="rounded-full border border-ink/10 bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink/80">
            Size: {line.size}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-ink/50">
        {line.quantity} × {formatVND(line.unitPrice)}
      </p>
    </div>

    <span className="flex-shrink-0 text-xs font-bold text-ink">{formatVND(line.lineTotal)}</span>
  </div>
);

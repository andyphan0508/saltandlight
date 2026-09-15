import Link from "next/link";
import { normalizeVietnamesePhone } from "@/helpers/phone";
import { Phone, Truck } from "../Icons";

/** Announcement strip with order tracking and the hotline on desktop. */
export const TopBar = ({ phone }: { phone: string }) => (
  <div className="border-b border-ink/5 bg-mint-50/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-ink/80">
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest flex-shrink-0">
          <Truck size={12} />
        </span>
        <span className="font-bold text-brand-forest truncate block text-[11px] sm:text-xs uppercase tracking-wider">
          Đồng giá ship 19K toàn quốc
        </span>
      </div>
      <div className="hidden lg:flex items-center gap-6">
        <Link href="/tra-cuu-don-hang" className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink transition-colors">
          <Truck size={14} />
          <span>Tra cứu đơn hàng</span>
        </Link>
        <a
          href={`tel:${normalizeVietnamesePhone(phone)}`}
          className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink transition-colors"
        >
          <Phone size={13} />
          <span>Hotline: {phone}</span>
        </a>
      </div>
    </div>
  </div>
);

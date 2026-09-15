import Link from "next/link";
import { normalizeVietnamesePhone } from "@/helpers/phone";
import { ChevronRight, Phone, ShieldCheck, Truck } from "../Icons";

interface DrawerSupportLinksProps {
  phone: string;
  onNavigate: () => void;
}

const rowClass =
  "flex items-center justify-between rounded-xl px-2 py-1.5 font-semibold text-ink hover:bg-mint-50 transition-colors active-press";

/** Order tracking, return policy and a tap-to-call hotline. */
export const DrawerSupportLinks = ({ phone, onNavigate }: DrawerSupportLinksProps) => (
  <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3 shadow-xs">
    <div className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Dịch vụ &amp; Hỗ trợ</div>

    <div className="grid grid-cols-1 gap-2 text-xs">
      <Link href="/tra-cuu-don-hang" onClick={onNavigate} className={rowClass}>
        <div className="flex items-center gap-2.5">
          <Truck size={16} className="text-brand-forest" />
          <span>Tra cứu hành trình đơn hàng</span>
        </div>
        <ChevronRight size={14} className="text-ink/30" />
      </Link>

      <Link href="/chinh-sach" onClick={onNavigate} className={rowClass}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-brand-forest" />
          <span>Chính sách đổi trả 7 ngày</span>
        </div>
        <ChevronRight size={14} className="text-ink/30" />
      </Link>

      <a href={`tel:${normalizeVietnamesePhone(phone)}`} className={rowClass}>
        <div className="flex items-center gap-2.5">
          <Phone size={16} className="text-brand-forest" />
          <span>Hotline: {phone}</span>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Gọi ngay</span>
      </a>
    </div>
  </div>
);

import {
  Truck,
  Sparkles,
  Gift,
  RefreshCw,
  CrossIcon,
  ShieldCheck,
} from "./Icons";

const HIGHLIGHTS = [
  { icon: Truck, text: "ĐỒNG GIÁ SHIP 19K TOÀN QUỐC" },
  { icon: Sparkles, text: "100% COTTON 4 CHIỀU CAO CẤP" },
  { icon: Gift, text: "MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 299K" },
  { icon: RefreshCw, text: "ĐỔI SIZE DỄ DÀNG TRONG 7 NGÀY" },
  { icon: CrossIcon, text: "LAN TOẢ LỜI CHÚA QUA TỪNG CHIẾC ÁO" },
  { icon: ShieldCheck, text: "IN LỤA CAO CẤP BỀN MÀU" },
];

export function MarqueeBanner() {
  return (
    <div className="overflow-hidden bg-ink py-2 text-white border-y border-ink-800 select-none">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-[11px] font-bold tracking-widest uppercase">
        {[...HIGHLIGHTS, ...HIGHLIGHTS].map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} className="flex items-center gap-8">
              <span className="inline-flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                <Icon size={14} className="text-mint-300 flex-shrink-0" />
                <span>{item.text}</span>
              </span>
              <span className="text-mint-400/50 text-xs" aria-hidden>✦</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

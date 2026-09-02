const HIGHLIGHTS = [
  "🕊️ ĐỒNG GIÁ SHIP 19K TOÀN QUỐC",
  "✨ 100% COTTON 4 CHIỀU CAO CẤP",
  "🎁 MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 299K",
  "🔄 ĐỔI SIZE DỄ DÀNG TRONG 7 NGÀY",
  "✝️ LAN TOẢ LỜI CHÚA QUA TỪNG CHIẾC ÁO",
  "💎 IN LỤA CAO CẤP BỀN MÀU",
];

export function MarqueeBanner() {
  return (
    <div className="overflow-hidden bg-ink py-2 text-white border-y border-ink-800 select-none">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-[11px] font-bold tracking-widest uppercase">
        {[...HIGHLIGHTS, ...HIGHLIGHTS].map((text, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="opacity-90 hover:opacity-100 transition-opacity">{text}</span>
            <span className="text-mint-300 opacity-60" aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

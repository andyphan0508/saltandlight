const TEXT = "ĐỒNG GIÁ SHIP 19K TOÀN QUỐC";

export function MarqueeBanner() {
  const items = Array.from({ length: 8 }, () => TEXT);
  return (
    <div className="overflow-hidden bg-ink py-2 text-white">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold tracking-widest">
        {[...items, ...items].map((text, i) => (
          <span key={i} className="flex items-center gap-8">
            {text}
            <span aria-hidden>—</span>
          </span>
        ))}
      </div>
    </div>
  );
}

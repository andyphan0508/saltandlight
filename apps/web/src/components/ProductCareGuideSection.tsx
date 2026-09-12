import React from "react";
import { Sparkles, ShieldCheck, Check } from "./Icons";
import type { CareGuide } from "@/lib/care-guide-types";

function renderCareIcon(iconName: string) {
  switch (iconName) {
    case "Soap":
    case "Wash":
    case "🧼":
      return <span className="text-xl">🧼</span>;
    case "Sun":
    case "🌤️":
      return <span className="text-xl">🌤️</span>;
    case "Iron":
    case "👔":
      return <span className="text-xl">👔</span>;
    case "Shield":
    case "ShieldCheck":
    case "🛡️":
      return <ShieldCheck size={22} className="text-brand-forest" />;
    case "Sparkles":
    case "✨":
      return <Sparkles size={22} className="text-brand-forest" />;
    case "Check":
      return <Check size={22} className="text-brand-forest" />;
    case "Water":
    case "💧":
      return <span className="text-xl">💧</span>;
    case "Flame":
    case "🔥":
      return <span className="text-xl">🔥</span>;
    case "Warning":
    case "⚠️":
      return <span className="text-xl">⚠️</span>;
    default:
      if (iconName && iconName.length <= 4) {
        return <span className="text-xl">{iconName}</span>;
      }
      return <Sparkles size={22} className="text-brand-forest" />;
  }
}

export function ProductCareGuideSection({ guide }: { guide: CareGuide }) {
  if (!guide || !guide.isActive || !guide.items || guide.items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-gradient-to-br from-mint-50/50 via-white to-cream/30 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
              <Sparkles size={11} />
              Chăm sóc &amp; Bảo quản
            </span>
            <span className="text-[11px] font-semibold text-ink/40 hidden sm:inline">•</span>
            <span className="text-[11px] font-semibold text-ink/60 hidden sm:inline">Chính hãng Salt &amp; Light</span>
          </div>
          <h3 className="mt-1.5 font-display text-base sm:text-lg font-bold uppercase text-ink tracking-tight">
            {guide.title}
          </h3>
          {guide.subtitle && (
            <p className="mt-0.5 text-xs text-ink/65 leading-relaxed">
              {guide.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Care items grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
        {guide.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/90 border border-ink/5 shadow-2xs hover:border-brand-forest/30 hover:shadow-xs transition-all duration-200"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100/70 text-brand-forest">
              {renderCareIcon(item.icon)}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wide">
                {item.title}
              </h4>
              <p className="text-xs text-ink/75 leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center gap-2 text-[11px] text-ink/50 italic">
        <Sparkles size={13} className="text-brand-forest/70 shrink-0" />
        <span>Thực hiện đúng hướng dẫn trên sẽ giúp sợi vải 100% Cotton và hình in luôn như mới sau nhiều lần giặt.</span>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import type { SiteSettingsData } from "@/interfaces/site-settings";

/** Scaled-down mock of the real Footer. */
export const FooterPreview = ({ settings }: { settings: SiteSettingsData }) => (
  <div className="p-4">
    <div className="rounded-xl border border-ink/10 bg-mint-50/70 p-4 space-y-4">
      <div className="relative h-8 w-32">
        {settings.footerLogoUrl && (
          <Image src={settings.footerLogoUrl} alt="Logo" fill className="object-contain object-left" unoptimized />
        )}
      </div>
      <p className="text-[10px] text-ink/60 leading-relaxed line-clamp-3">{settings.footerBrandText}</p>
      <div className="space-y-1 text-[10px] text-ink/60">
        <div>{settings.footerAddress}</div>
        <div>{settings.footerPhone}</div>
        <div>{settings.footerEmail}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {settings.footerColumns.map((column, i) => (
          <div key={i}>
            <div className="text-[9px] font-bold uppercase text-ink">{column.title || "…"}</div>
            <div className="mt-1 space-y-0.5">
              {column.items.map((item, j) => (
                <div key={j} className="text-[9px] text-ink/60">
                  {item.label || "…"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {settings.footerSocialLinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {settings.footerSocialLinks.map((link, i) => (
            <span key={i} className="rounded-lg bg-white border border-ink/10 px-2 py-1 text-[9px] font-bold text-ink/70">
              {link.platform || "…"}
            </span>
          ))}
        </div>
      )}
    </div>
    <p className="mt-3 text-center text-[10px] text-slate-400">Bản xem trước thu nhỏ.</p>
  </div>
);

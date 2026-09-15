"use client";

import Image from "next/image";
import { LOGO_SIZE_CLASSES, type SiteSettingsData } from "@/interfaces/site-settings";

// The preview column is narrow, so keep only the base (mobile) logo size classes
const baseClasses = (classes: string) =>
  classes
    .split(" ")
    .filter((c) => !c.includes("sm:") && !c.includes("lg:"))
    .join(" ");

const NavPills = ({ items }: { items: SiteSettingsData["headerNavItems"]["left"] }) => (
  <>
    {items.map((item, i) => (
      <span key={i} className="rounded-full bg-ink/5 px-2 py-1 text-[9px] font-bold uppercase text-ink/70 whitespace-nowrap">
        {item.label || "…"}
      </span>
    ))}
  </>
);

/** Scaled-down mock of the real Header — mirrors Header.tsx's structure, not an iframe of the live site. */
export const HeaderPreview = ({ settings }: { settings: SiteSettingsData }) => (
  <div className="p-4">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-ink/10 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1 justify-self-start">
        <NavPills items={settings.headerNavItems.left} />
      </div>
      <div className={`relative ${baseClasses(LOGO_SIZE_CLASSES[settings.logoSize].header)}`}>
        {settings.logoUrl && <Image src={settings.logoUrl} alt="Logo" fill className="object-contain" unoptimized />}
      </div>
      <div className="flex flex-wrap items-center gap-1 justify-self-end">
        <NavPills items={settings.headerNavItems.right} />
      </div>
    </div>
    <p className="mt-3 text-center text-[10px] text-slate-400">Bản xem trước thu nhỏ — kích thước thật sẽ lớn hơn trên desktop.</p>
  </div>
);

"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { CategoryOption } from "@/interfaces/catalog";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/interfaces/site-settings";
import { useMobileMenuStore } from "@/stores/mobile-menu-store";
import { X } from "./Icons";
import { DrawerAccountCard } from "./mobile-drawer/DrawerAccountCard";
import { DrawerCategoryGrid } from "./mobile-drawer/DrawerCategoryGrid";
import { DrawerNavLinks } from "./mobile-drawer/DrawerNavLinks";
import { DrawerSupportLinks } from "./mobile-drawer/DrawerSupportLinks";
import { usePresence } from "@/hooks/use-presence";

interface MobileDrawerProps {
  categories: CategoryOption[];
  siteSettings?: SiteSettingsData;
}

/** Mobile bottom-sheet menu. `data-modal` locks page scroll (globals.css); Escape or the backdrop closes it. */
export const MobileDrawer = ({ categories, siteSettings = DEFAULT_SITE_SETTINGS }: MobileDrawerProps) => {
  const pathname = usePathname();
  const isOpen = useMobileMenuStore((s) => s.isOpen);
  const setIsOpen = useMobileMenuStore((s) => s.setIsOpen);
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setIsOpen]);

  const { isMounted, isClosing } = usePresence(isOpen, 250);
  if (!isMounted) return null;

  return (
    <div data-modal className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng di động"
        className={`relative z-10 flex max-h-[88vh] w-full flex-col rounded-t-[32px] bg-[#FDFBF7] shadow-[0_-16px_50px_rgba(0,0,0,0.25)] border-t border-ink/10 overflow-hidden ${isClosing ? "animate-sheet-down" : "animate-sheet-up"}`}
      >
        <div className="flex justify-center pt-3 pb-2 cursor-pointer flex-shrink-0" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-ink/20 hover:bg-ink/40 transition-colors" />
        </div>

        <div className="flex items-center justify-between border-b border-ink/5 px-6 pb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-28">
              <Image src={siteSettings.logoUrl} alt="Salt & Light" fill sizes="112px" className="object-contain object-left" />
            </div>
            <span className="rounded-full bg-brand-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-forest">
              Menu
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70 hover:bg-ink/10 active-press"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto native-scroll px-5 py-4 space-y-5">
          <DrawerAccountCard onNavigate={onClose} />
          <DrawerCategoryGrid categories={categories} onNavigate={onClose} />
          <DrawerNavLinks
            items={[...siteSettings.headerNavItems.left, ...siteSettings.headerNavItems.right]}
            pathname={pathname}
            onNavigate={onClose}
          />
          <DrawerSupportLinks phone={siteSettings.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone} onNavigate={onClose} />

          <div className="text-center py-2">
            <p className="text-[11px] italic text-ink/50">&ldquo;Các con là muối của đất... là ánh sáng của thế gian.&rdquo;</p>
            <p className="text-[10px] font-semibold text-brand-forest/60 mt-0.5">— Ma-thi-ơ 5:13-14</p>
          </div>
        </div>
      </div>
    </div>
  );
};

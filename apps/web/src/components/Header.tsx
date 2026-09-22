"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryOption } from "@/interfaces/catalog";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/interfaces/site-settings";
import { useMobileMenuStore } from "@/stores/mobile-menu-store";
import { useSearchModalStore } from "@/stores/search-store";
import { CategoryDropdown } from "./header/CategoryDropdown";
import { HeaderActions } from "./header/HeaderActions";
import { HeaderNavLinks } from "./header/HeaderNavLinks";
import { TopBar } from "./header/TopBar";
import { Search } from "./Icons";
import { Logo } from "./Logo";
import { MarqueeBanner } from "./MarqueeBanner";

interface HeaderProps {
  categories: CategoryOption[];
  siteSettings?: SiteSettingsData;
}

export const Header = ({ categories, siteSettings = DEFAULT_SITE_SETTINGS }: HeaderProps) => {
  const pathname = usePathname();
  const setIsMobileMenuOpen = useMobileMenuStore((s) => s.setIsOpen);
  const setIsSearchOpen = useSearchModalStore((s) => s.setIsOpen);
  const { left, right } = siteSettings.headerNavItems;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Phones: scrolling down slides the header away to give the products the screen; any
  // scroll back up brings it straight back. Direction is read once per frame, and the
  // move itself is a CSS transform (globals.css, .site-header), so nothing reflows.
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const header = headerRef.current;
        if (!header) return;
        const y = window.scrollY;
        if (Math.abs(y - lastY) < 8) return;
        header.toggleAttribute("data-tucked", y > lastY && y > header.offsetHeight);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // A new page starts at the top with the header in view
  useEffect(() => {
    headerRef.current?.removeAttribute("data-tucked");
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      className="site-header sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-ink/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
    >
      <TopBar phone={siteSettings.footerPhone || DEFAULT_SITE_SETTINGS.footerPhone} />

      {/*
        3-column grid (1fr / auto / 1fr) keeps the logo mathematically centered
        regardless of how much content sits in the left/right columns — a flex
        justify-between row can't guarantee that once the two sides differ.
      */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-1 justify-self-start">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={19} />
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              <HeaderNavLinks items={left} pathname={pathname} />
              <CategoryDropdown categories={categories} />
            </nav>
          </div>

          <Link href="/" className="flex flex-shrink-0 items-center justify-self-center group py-1">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <Logo
                src={siteSettings.logoUrl}
                size={siteSettings.logoSize}
                placement="header"
                alt="Salt & Light - Áo Thun Lời Chúa"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-1 justify-self-end sm:gap-2">
            <nav className="hidden items-center gap-1 lg:flex">
              <HeaderNavLinks items={right} pathname={pathname} />
            </nav>
            <HeaderActions />
          </div>
        </div>
      </div>

      <MarqueeBanner />
    </header>
  );
};

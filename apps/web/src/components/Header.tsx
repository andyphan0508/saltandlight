"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMobileMenuStore } from "@/lib/mobile-menu-store";
import { useSearchModalStore } from "@/lib/search-store";
import { NAV_LEFT, NAV_RIGHT } from "@/lib/nav-items";
import { MarqueeBanner } from "./MarqueeBanner";
import { Heart, Search, Phone, Truck, ChevronDown } from "./Icons";

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function Header({ categories }: { categories: CategoryNavItem[] }) {
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const setMobileMenuOpen = useMobileMenuStore((s) => s.setOpen);
  const setSearchOpen = useSearchModalStore((s) => s.setOpen);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoryMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isCategoryActive = pathname.startsWith("/san-pham") || pathname.startsWith("/danh-muc");

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md transition-all border-b border-ink/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Top micro announcement bar */}
      <div className="hidden border-b border-ink/5 bg-mint-50/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-ink/75 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-brand-forest">
              Đồng giá ship 19K toàn quốc • Đơn từ 299K Freeship
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/tra-cuu-don-hang"
              className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink transition-colors"
            >
              <Truck size={14} />
              <span>Tra cứu đơn hàng</span>
            </Link>
            <a
              href="tel:0847252025"
              className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink transition-colors"
            >
              <Phone size={13} />
              <span>Hotline: 0847 25 2025</span>
            </a>
          </div>
        </div>
      </div>

      {/*
        3-column grid (1fr / auto / logo / auto / 1fr) keeps the logo
        mathematically centered regardless of how much content sits in the
        left/right columns — a flex justify-between row can't guarantee
        that once the two sides hold different content (e.g. once the cart
        button moved out to a FAB, the old flex layout skewed off-center).
      */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Left column */}
          <div className="flex items-center gap-1 justify-self-start">
            {/* Mobile: search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={19} />
            </button>

            {/* Desktop nav (left) */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LEFT.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive(item.href)
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink/85 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Danh mục dropdown */}
              <div ref={categoryMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen((v) => !v)}
                  className={`flex items-center gap-1 rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isCategoryActive && !categoryMenuOpen
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink/85 hover:bg-ink/5 hover:text-ink"
                  }`}
                  aria-expanded={categoryMenuOpen}
                >
                  Danh mục
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {categoryMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-ink/10 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/san-pham"
                      className="block rounded-xl px-3 py-2 text-xs font-bold uppercase text-ink hover:bg-mint-50"
                    >
                      Tất cả sản phẩm
                    </Link>
                    <div className="my-1 border-t border-ink/5" />
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/san-pham?categories=${c.slug}`}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink/75 hover:bg-mint-50 hover:text-ink"
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-ink/35">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center: logo */}
          <Link href="/" className="flex flex-shrink-0 items-center justify-self-center group py-1">
            <div className="relative h-11 sm:h-14 lg:h-16 w-40 sm:w-56 lg:w-60 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Salt & Light - Áo Thun Lời Chúa"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 160px, 240px"
              />
            </div>
          </Link>

          {/* Right column */}
          <div className="flex items-center gap-1 justify-self-end sm:gap-2">
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_RIGHT.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive(item.href)
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink/85 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop search trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:flex"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={18} />
            </button>

            {/* Wishlist */}
            <Link
              href="/yeu-thich"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-all"
              aria-label="Sản phẩm yêu thích"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-black text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <MarqueeBanner />
    </header>
  );
}

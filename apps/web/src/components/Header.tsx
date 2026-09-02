"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { MarqueeBanner } from "./MarqueeBanner";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Phone,
  Truck,
  ChevronRight
} from "./Icons";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Tất cả sản phẩm" },
  { href: "/danh-muc/ao-thun-nguoi-lon", label: "Áo người lớn" },
  { href: "/danh-muc/ao-thun-cho-be", label: "Áo cho bé" },
  { href: "/danh-muc/tui-tote-canvas", label: "Túi Tote" },
  { href: "/dat-theo-yeu-cau", label: "Đặt may theo yêu cầu" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0)
  );
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md transition-all border-b border-ink/5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* 1. Top micro announcement bar */}
      <div className="border-b border-ink/5 bg-mint-50/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-ink/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-brand-forest">
              Đồng giá ship 19K toàn quốc • Đơn từ 299K Freeship
            </span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
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

      {/* 2. Main Navigation Bar */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          {/* Mobile Left: Menu Toggle */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2 text-ink hover:bg-ink/5 active:scale-95 transition-all"
              aria-label="Mở menu điều hướng"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center group py-1">
            <div className="relative h-12 sm:h-14 lg:h-16 w-44 sm:w-56 lg:w-60 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Salt & Light - Áo Thun Lời Chúa"
                fill
                priority
                className="object-contain object-left"
                sizes="(max-width: 640px) 180px, 240px"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center max-w-3xl">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap select-none ${
                    isActive
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink/85 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden lg:flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-36 xl:w-48 rounded-full border border-ink/15 bg-white/90 py-1.5 pl-8 pr-3 text-xs font-medium placeholder-ink/40 transition-all duration-200 focus:w-56 focus:border-ink focus:bg-white focus:outline-none shadow-sm"
              />
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
              />
            </form>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={19} />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/yeu-thich"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-all"
              aria-label="Sản phẩm yêu thích"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-black text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Pill Button */}
            <Link
              href="/gio-hang"
              className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-ink px-3 sm:px-3.5 py-1.5 text-white hover:bg-ink-800 active:scale-95 transition-all shadow-sm"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={17} className="text-white" />
              <span className="text-xs font-bold tracking-wider">
                {cartCount > 0 ? `${cartCount}` : "0"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="border-t border-ink/10 bg-white px-4 py-3 lg:hidden shadow-md animate-in slide-in-from-top-2 duration-200">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm áo thun, túi tote, câu Kinh Thánh..."
              className="w-full rounded-full border border-ink/20 bg-cream/40 py-2 pl-9 pr-10 text-xs sm:text-sm focus:border-ink focus:bg-white focus:outline-none"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 p-1"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* 3. Marquee Banner Ticker */}
      <MarqueeBanner />

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-cream p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header in Drawer */}
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div className="relative h-9 w-32">
                <Image
                  src="/images/logo.png"
                  alt="Salt & Light"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-ink/60 hover:bg-ink/5"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="mt-6 flex-1 overflow-y-auto space-y-1.5 pr-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "bg-ink text-white shadow-sm"
                        : "text-ink/80 hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      size={16}
                      className={isActive ? "text-white" : "text-ink/30"}
                    />
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-ink/10 mt-3 space-y-1.5">
                <Link
                  href="/gioi-thieu"
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-ink/5"
                >
                  <span>Về chúng tôi</span>
                  <ChevronRight size={14} className="text-ink/30" />
                </Link>
                <Link
                  href="/lien-he"
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-ink/5"
                >
                  <span>Liên hệ hỗ trợ</span>
                  <ChevronRight size={14} className="text-ink/30" />
                </Link>
                <Link
                  href="/chinh-sach"
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-ink/5"
                >
                  <span>Chính sách đổi trả 7 ngày</span>
                  <ChevronRight size={14} className="text-ink/30" />
                </Link>
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div className="border-t border-ink/10 pt-4 space-y-3 text-xs text-ink/70">
              <Link
                href="/tra-cuu-don-hang"
                className="flex items-center gap-2 font-bold uppercase text-ink hover:text-brand-forest"
              >
                <Truck size={16} />
                <span>Tra cứu đơn hàng</span>
              </Link>
              <div className="flex items-center gap-2">
                <Phone size={15} />
                <span>Hotline: 0847 25 2025</span>
              </div>
              <p className="text-[11px] text-ink/50 pt-1">
                &ldquo;Các con là muối của đất... là ánh sáng của thế
                gian.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

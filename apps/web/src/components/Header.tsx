"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { MarqueeBanner } from "./MarqueeBanner";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Về chúng tôi" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/dat-theo-yeu-cau", label: "Đặt theo yêu cầu" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Header() {
  const cartCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-black uppercase tracking-tight">
          Salt &amp; Light
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wide md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/tra-cuu-don-hang" className="hidden text-xs font-semibold uppercase hover:opacity-60 sm:block">
            Tra cứu đơn hàng
          </Link>
          <Link href="/yeu-thich" className="relative" aria-label="Yêu thích">
            <HeartIcon />
            {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
          </Link>
          <Link href="/gio-hang" className="relative" aria-label="Giỏ hàng">
            <BagIcon />
            {cartCount > 0 && <CountBadge count={cartCount} />}
          </Link>
        </div>
      </div>
      <MarqueeBanner />
    </header>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2.1 0 3.7 1.1 6 3.6 2.3-2.5 3.9-3.6 6-3.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

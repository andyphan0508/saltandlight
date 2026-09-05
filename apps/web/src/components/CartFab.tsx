"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingBag } from "./Icons";

/**
 * Universal Floating Action Button (FAB) for the Shopping Cart.
 * Visible on both Mobile (floating conveniently above the BottomTabBar)
 * and Desktop with smooth micro-interactions and prominent badge counter.
 */
export function CartFab() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const [bumping, setBumping] = useState(false);

  // Trigger subtle pop/bump animation whenever cart count increments
  useEffect(() => {
    if (cartCount > 0) {
      setBumping(true);
      const timer = setTimeout(() => setBumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  if (pathname === "/gio-hang" || pathname === "/thanh-toan") {
    return null;
  }

  return (
    <Link
      href="/gio-hang"
      aria-label="Giỏ hàng Salt & Light"
      className={`group fixed z-40 flex items-center gap-2.5 rounded-full bg-ink text-white shadow-2xl transition-all duration-300 active-press
        bottom-20 right-4 p-3.5 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8 lg:px-4 lg:py-3.5
        hover:bg-ink-800 hover:shadow-brand-forest/20 hover:ring-4 hover:ring-brand-forest/20
        ${bumping ? "scale-110 ring-4 ring-brand-forest/40" : "scale-100"}`}
    >
      <span className="relative flex items-center justify-center">
        <ShoppingBag size={21} className="transition-transform group-hover:scale-110" />
        {cartCount > 0 && (
          <span
            className={`absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1.5 text-[11px] font-black text-white shadow-md border-2 border-ink transition-transform duration-300 ${
              bumping ? "scale-125" : "scale-100"
            }`}
          >
            {cartCount}
          </span>
        )}
      </span>

      {/* Label: visible on desktop hover or can be seen subtly */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider opacity-0 transition-all duration-300 lg:group-hover:max-w-[8rem] lg:group-hover:opacity-100">
        Giỏ hàng
      </span>
    </Link>
  );
}


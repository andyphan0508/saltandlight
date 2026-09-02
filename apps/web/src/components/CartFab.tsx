"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingBag } from "./Icons";

/**
 * Desktop-only — mobile already surfaces the cart via BottomTabBar, so this
 * would just duplicate it there. Rendered as a layout-level sibling (not
 * inside <header>) so it isn't affected by header's backdrop-filter
 * containing-block quirk (see BottomTabBar/MobileDrawer for the same note).
 */
export function CartFab() {
  const cartCount = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

  return (
    <Link
      href="/gio-hang"
      aria-label="Giỏ hàng"
      className="group fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-ink px-4 py-3.5 text-white shadow-lg shadow-ink/20 transition-all hover:pr-5 hover:shadow-xl active:scale-95 lg:flex"
    >
      <span className="relative flex-shrink-0">
        <ShoppingBag size={20} />
        {cartCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-black text-white">
            {cartCount}
          </span>
        )}
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wide opacity-0 transition-all duration-200 group-hover:max-w-[7rem] group-hover:opacity-100">
        Giỏ hàng
      </span>
    </Link>
  );
}

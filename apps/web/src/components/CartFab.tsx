"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useStoreHydrated } from "@/lib/use-store-hydrated";
import type { SiteSettingsData } from "@/lib/site-settings-types";
import { ShoppingBag, Phone, ZaloIcon } from "./Icons";

export interface CartFabProps {
  siteSettings?: SiteSettingsData;
}

/**
 * Universal Floating Action Buttons (FAB) group:
 * - Phone (Hotline dialer)
 * - Zalo (Direct Zalo chat)
 * - Shopping Cart (with reactive badge counter & bump animation)
 *
 * Positioned cleanly in the bottom-right corner, floating above the mobile BottomTabBar,
 * with smooth micro-interactions, responsive labels on desktop hover, and direct routing.
 */
export function CartFab({ siteSettings }: CartFabProps) {
  const pathname = usePathname();
  const cartHydrated = useStoreHydrated(useCartStore);
  const cartCount = useCartStore((s) => (cartHydrated ? s.lines.reduce((sum, l) => sum + l.quantity, 0) : 0));
  const [bumping, setBumping] = useState(false);

  // Trigger subtle pop/bump animation whenever cart count increments
  useEffect(() => {
    if (cartCount > 0) {
      setBumping(true);
      const timer = setTimeout(() => setBumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isCartPage = pathname === "/gio-hang";
  const isCheckoutPage = pathname === "/thanh-toan";

  // Derive normalized phone number and routing links
  const rawPhone = siteSettings?.footerPhone || "0847 25 2025";
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const localPhone =
    digitsOnly.startsWith("84") && digitsOnly.length === 11
      ? `0${digitsOnly.slice(2)}`
      : digitsOnly.startsWith("0")
      ? digitsOnly
      : `0${digitsOnly || "847252025"}`;

  const telLink = `tel:${localPhone}`;

  // Check if siteSettings has an explicit Zalo URL configured
  const customZaloUrl = siteSettings?.footerSocialLinks?.find(
    (s) => s.platform.toLowerCase() === "zalo"
  )?.url;
  const zaloLink = customZaloUrl || `https://zalo.me/${localPhone}`;

  return (
    <div
      className="fixed z-40 right-3.5 bottom-20 sm:right-6 sm:bottom-24 lg:right-8 lg:bottom-8 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none"
      aria-label="Cụm nút hỗ trợ và giỏ hàng"
    >
      {/* 1. Phone / Hotline FAB */}
      <a
        href={telLink}
        aria-label={`Gọi hotline tư vấn: ${rawPhone}`}
        title={`Hotline tư vấn: ${rawPhone}`}
        className="pointer-events-auto group relative flex items-center gap-2 rounded-full bg-emerald-600 text-white shadow-xl transition-all duration-300 active-press
          p-2.5 sm:p-3 lg:px-3.5 lg:py-3
          hover:bg-emerald-700 hover:shadow-emerald-600/30 hover:ring-4 hover:ring-emerald-500/25 animate-pop-in"
      >
        {/* Subtle pulsing halo */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-30 animate-ping pointer-events-none" />
        <span className="relative flex items-center justify-center">
          <Phone size={20} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider opacity-0 transition-all duration-300 lg:group-hover:max-w-[12rem] lg:group-hover:opacity-100 lg:group-hover:pr-1">
          Gọi: {rawPhone}
        </span>
      </a>

      {/* 2. Zalo Chat FAB */}
      <a
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Nhắn tin Zalo tư vấn: ${rawPhone}`}
        title="Nhắn tin Zalo tư vấn"
        className="pointer-events-auto group relative flex items-center gap-2 rounded-full bg-[#0068FF] text-white shadow-xl transition-all duration-300 active-press
          p-2.5 sm:p-3 lg:px-3.5 lg:py-3
          hover:bg-[#0055d6] hover:shadow-blue-500/30 hover:ring-4 hover:ring-blue-400/25 animate-pop-in"
      >
        <span className="relative flex items-center justify-center">
          <ZaloIcon size={20} className="transition-transform duration-300 group-hover:scale-110" />
        </span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider opacity-0 transition-all duration-300 lg:group-hover:max-w-[8rem] lg:group-hover:opacity-100 lg:group-hover:pr-1">
          Chat Zalo
        </span>
      </a>

      {/* 3. Shopping Cart FAB (Hidden when on cart or checkout pages) */}
      {!isCartPage && !isCheckoutPage && (
        <Link
          href="/gio-hang"
          aria-label="Giỏ hàng Salt & Light"
          className={`pointer-events-auto group relative items-center gap-2 rounded-full bg-ink text-white shadow-2xl transition-all duration-300 active-press
            p-2.5 sm:p-3 lg:px-3.5 lg:py-3
            hover:bg-ink-800 hover:shadow-brand-forest/20 hover:ring-4 hover:ring-brand-forest/20 animate-pop-in
            ${cartCount === 0 ? "hidden lg:flex" : "flex"}
            ${cartCount > 0 && !bumping ? "animate-pulse-glow" : ""}
            ${bumping ? "scale-110 ring-4 ring-brand-forest/40" : "scale-100"}`}
        >
          <span className="relative flex items-center justify-center">
            <ShoppingBag size={20} className="transition-transform duration-300 group-hover:scale-110" />
            {cartCount > 0 && (
              <span
                className={`absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1.5 text-[10px] font-black text-white shadow-md border-2 border-ink transition-transform duration-300 ${
                  bumping ? "scale-125 animate-bounce-soft" : "scale-100"
                }`}
              >
                {cartCount}
              </span>
            )}
          </span>

          {/* Label: visible on desktop hover */}
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider opacity-0 transition-all duration-300 lg:group-hover:max-w-[8rem] lg:group-hover:opacity-100 lg:group-hover:pr-1">
            Giỏ hàng
          </span>
        </Link>
      )}
    </div>
  );
}

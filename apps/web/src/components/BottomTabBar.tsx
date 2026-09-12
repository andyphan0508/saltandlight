"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCartStore,
  useWishlistStore,
  useMobileMenuStore,
  useStoreHydrated,
} from "@/stores";
import { Home, LayoutGrid, ShoppingBag, Heart, Menu } from "./Icons";

/**
 * Rendered as a sibling of <Header> (not inside it) — Header's
 * `backdrop-blur-md` creates a containing block for `position: fixed`
 * descendants, which would pin this to the bottom of the header instead of
 * the viewport if it lived inside it.
 */
export const BottomTabBar = () => {
  const pathname = usePathname();
  const cartHydrated = useStoreHydrated(useCartStore);
  const wishlistHydrated = useStoreHydrated(useWishlistStore);
  const cartCount = useCartStore((s) => (cartHydrated ? s.lines.reduce((sum, l) => sum + l.quantity, 0) : 0));
  const wishlistCount = useWishlistStore((s) => (wishlistHydrated ? s.productIds.length : 0));
  const setMobileMenuOpen = useMobileMenuStore((s) => s.setOpen);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-ink/10 bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <TabLink href="/" label="Trang chủ" active={pathname === "/"}>
        <Home size={21} />
      </TabLink>
      <TabLink href="/san-pham" label="Danh mục" active={isActive("/san-pham") || isActive("/danh-muc")}>
        <LayoutGrid size={21} />
      </TabLink>
      <TabLink href="/gio-hang" label="Giỏ hàng" active={isActive("/gio-hang")} badge={cartCount}>
        <ShoppingBag size={21} />
      </TabLink>
      <TabLink href="/yeu-thich" label="Yêu thích" active={isActive("/yeu-thich")} badge={wishlistCount}>
        <Heart size={21} />
      </TabLink>
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-ink/50 hover:text-ink active-press"
        aria-label="Mở menu"
      >
        <Menu size={21} />
        <span className="text-[10px] font-semibold">Menu</span>
      </button>
    </nav>
  );
};

const TabLink = ({
  href,
  label,
  active,
  badge,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors active-press ${
        active ? "text-ink" : "text-ink/50 hover:text-ink"
      }`}
    >
      <span className="relative">
        {children}
        {!!badge && badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[9px] font-bold text-white shadow-xs">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold">{label}</span>
      {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ink" />}
    </Link>
  );
};

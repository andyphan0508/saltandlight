"use client";

import Link from "next/link";
import { useCustomer } from "@/hooks/use-customer";
import { useSearchModalStore } from "@/stores/search-store";
import { useStoreHydrated } from "@/stores/use-store-hydrated";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Heart, Search, User } from "../Icons";

/** Right-hand header buttons: desktop search, wishlist with count, account or login. */
export const HeaderActions = () => {
  const { customer } = useCustomer();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const isWishlistHydrated = useStoreHydrated(useWishlistStore);
  const setIsSearchOpen = useSearchModalStore((s) => s.setIsOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="hidden h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:flex"
        aria-label="Tìm kiếm sản phẩm"
      >
        <Search size={18} />
      </button>

      <Link
        href="/yeu-thich"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-all"
        aria-label="Sản phẩm yêu thích"
      >
        <Heart size={20} />
        {isWishlistHydrated && wishlistCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white shadow-sm">
            {wishlistCount}
          </span>
        )}
      </Link>

      <Link
        href={customer ? "/tai-khoan" : "/dang-nhap"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-all active-press"
        aria-label={customer ? `Tài khoản (${customer.fullName})` : "Đăng nhập tài khoản"}
        title={customer ? `Xin chào, ${customer.fullName}` : "Đăng nhập tài khoản"}
      >
        {customer ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-forest text-white text-[11px] font-bold shadow-xs ring-2 ring-mint-200">
            {customer.fullName.trim().charAt(0).toUpperCase()}
          </div>
        ) : (
          <User size={19} />
        )}
      </Link>
    </>
  );
};

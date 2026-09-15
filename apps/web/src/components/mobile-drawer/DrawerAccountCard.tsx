"use client";

import Link from "next/link";
import { useCustomer } from "@/hooks/use-customer";
import { ChevronRight, LogOut, User } from "../Icons";

/** Signed-in customer shortcut with sign-out, or a login prompt. */
export const DrawerAccountCard = ({ onNavigate }: { onNavigate: () => void }) => {
  const { customer, onSignOut } = useCustomer();

  const onSignOutClick = async () => {
    await onSignOut();
    onNavigate();
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-3.5 shadow-xs">
      {customer ? (
        <div className="flex items-center justify-between gap-3">
          <Link href="/tai-khoan" onClick={onNavigate} className="flex items-center gap-3 min-w-0 flex-1 active-press">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest text-white font-bold text-sm ring-2 ring-mint-200">
              {customer.fullName.trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink truncate">{customer.fullName}</p>
              <p className="text-[10px] text-brand-forest font-semibold">Đơn hàng của tôi →</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onSignOutClick}
            className="rounded-xl p-2 text-ink/40 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <Link href="/dang-nhap" onClick={onNavigate} className="flex items-center gap-3 active-press">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">Đăng nhập tài khoản</p>
            <p className="text-[10px] text-ink/40">Xem lại lịch sử đơn hàng &amp; ưu đãi</p>
          </div>
          <ChevronRight size={16} className="text-ink/30" />
        </Link>
      )}
    </div>
  );
};

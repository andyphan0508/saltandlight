"use client";

import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { LogOut, ShoppingBag } from "@/components/Icons";

interface AccountProfileCardProps {
  customer: { fullName: string; email?: string | null; phone?: string | null };
  onLogout: () => void;
}

/** Customer avatar, name and contact details with shop and sign-out actions. */
export const AccountProfileCard = ({ customer, onLogout }: AccountProfileCardProps) => (
  <div className="rounded-3xl bg-gradient-to-r from-mint-50 via-white to-cream-50 p-6 sm:p-8 shadow-card border border-mint-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest text-white text-xl font-bold shadow-md ring-4 ring-mint-200/70">
        {customer.fullName.trim().charAt(0).toUpperCase() || "S"}
      </div>

      <div className="space-y-1 min-w-0">
        <span className="rounded-full bg-brand-forest/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
          Khách hàng thân thiết
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink truncate">{customer.fullName}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/65">
          {customer.email && <span>{customer.email}</span>}
          {customer.email && customer.phone && <span>•</span>}
          {customer.phone ? (
            <span>{customer.phone}</span>
          ) : (
            <span className="italic text-ink/40 text-[11px]">(Số điện thoại sẽ tự động lưu khi bạn đặt hàng)</span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <Link href="/san-pham">
        <Button variant="secondary" size="sm" className="whitespace-nowrap">
          <ShoppingBag size={15} />
          <span>Mua sắm</span>
        </Button>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-1.5 rounded-2xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-bold text-ink/75 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors active-press"
      >
        <LogOut size={14} />
        <span>Đăng xuất</span>
      </button>
    </div>
  </div>
);

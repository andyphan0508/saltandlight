"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/admin/site-url";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Wallet,
  Truck,
  Users,
  UserCog,
  History,
  LogOut,
  ExternalLink,
  Sparkles,
} from "./Icons";

const NAV_GROUPS: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: (props: { size?: number | string; className?: string }) => JSX.Element;
    badge?: string;
  }[];
}[] = [
  {
    label: "Tổng quan",
    items: [
      { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/banners", label: "Banner & Slider", icon: Sparkles },
      { href: "/admin/page-builder", label: "Xây dựng trang", icon: LayoutGrid },
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/payments", label: "Thanh toán", icon: Wallet },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/admin/shipping", label: "Vận chuyển", icon: Truck },
      { href: "/admin/customers", label: "Khách hàng", icon: Users },
      { href: "/admin/settings/payment", label: "Cài đặt thanh toán", icon: Wallet },
    ],
  },
];

const OWNER_GROUP = {
  label: "Quản trị hệ thống",
  items: [
    { href: "/admin/users", label: "Nhân viên", icon: UserCog },
    { href: "/admin/audit-log", label: "Nhật ký hoạt động", icon: History },
  ],
};

export function Sidebar({
  role,
  email,
  fullName,
}: {
  role: string;
  email: string;
  fullName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const groups = role === "owner" ? [...NAV_GROUPS, OWNER_GROUP] : NAV_GROUPS;
  const displayName = fullName || email.split("@")[0] || email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white select-none transition-all">
      {/* 1. Brand Logo Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="relative h-10 w-36 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Salt & Light"
              fill
              priority
              sizes="144px"
              className="object-contain object-left"
            />
          </div>
        </Link>
        <span className="rounded-md bg-mint-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-forest border border-mint-200">
          Admin
        </span>
      </div>

      {/* 2. Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-ink text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-100/60 text-slate-500 group-hover:bg-mint-100 group-hover:text-brand-forest"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Bottom Storefront Quick Link & User Profile Card */}
      <div className="border-t border-slate-100 p-3.5 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-mint-50/70 hover:text-brand-forest hover:border-mint-200 transition-all"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Cửa hàng trực tuyến
          </span>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-200/60">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest font-bold text-xs text-white shadow-xs">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-ink leading-tight">
              {displayName}
            </div>
            <div className="truncate text-[10px] uppercase font-semibold text-brand-forest">
              {role}
            </div>
          </div>
          <button
            onClick={signOut}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-sale hover:shadow-xs transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/admin/site-url";
import {
  LayoutGrid,
  FolderTree,
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
  Tag,
  Globe,
  MessageSquare,
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
      { href: "/admin/editor", label: "Editor", icon: Sparkles, badge: "Live" },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
      { href: "/admin/promotions", label: "Mã & Khuyến mãi", icon: Tag },
      { href: "/admin/banners", label: "Banner & Slider", icon: Sparkles },
      { href: "/admin/page-builder", label: "Bố cục trang chủ", icon: LayoutGrid },
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/payments", label: "Xác nhận thanh toán", icon: Wallet },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/admin/contacts", label: "Yêu cầu liên hệ", icon: MessageSquare },
      { href: "/admin/customers", label: "Khách hàng", icon: Users },
      { href: "/admin/settings/payment", label: "Cài đặt thanh toán", icon: Wallet },
      { href: "/admin/settings/site", label: "Header & Footer", icon: Globe },
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
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white select-none transition-all shadow-xs">
      {/* 1. Brand Logo Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4.5 bg-gradient-to-b from-slate-50/50 to-transparent">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="relative h-9 w-32 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Salt & Light"
              fill
              priority
              sizes="128px"
              className="object-contain object-left"
            />
          </div>
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest border border-emerald-200/80 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Admin
        </span>
      </div>

      {/* 2. Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    prefetch={false}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/15 text-emerald-300"
                            : "bg-slate-100/80 text-slate-500 group-hover:bg-emerald-50 group-hover:text-brand-forest"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Bottom Storefront Quick Link & User Profile Card */}
      <div className="border-t border-slate-100 p-3.5 space-y-2 bg-slate-50/40">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 to-mint-50/40 px-3 py-2.5 text-[11px] font-bold text-brand-forest hover:bg-emerald-100/60 hover:border-emerald-300 transition-all shadow-2xs group"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Cửa hàng trực tuyến</span>
          </span>
          <ExternalLink size={12} className="text-slate-400 group-hover:text-brand-forest transition-colors" />
        </Link>

        <div className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-forest font-bold text-xs text-white shadow-xs ring-2 ring-emerald-500/20">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-slate-900 leading-tight">
              {displayName}
            </div>
            <div className="truncate text-[10px] font-semibold text-brand-forest">
              {role === "owner" ? "Chủ cửa hàng" : role === "admin" ? "Quản trị viên" : "Nhân viên"}
            </div>
          </div>
          <button
            onClick={signOut}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

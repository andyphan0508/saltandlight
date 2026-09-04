"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/site-url";
import { Search, ExternalLink, Plus, Bell, ChevronDown, LogOut, KeyRound } from "./Icons";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function AdminHeader({
  email,
  fullName,
  role
}: {
  email: string;
  fullName?: string | null;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const displayName = fullName || email.split("@")[0] || email;
  const initial = displayName.charAt(0).toUpperCase();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/orders?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Generate breadcrumb from path
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbNameMap: Record<string, string> = {
    dashboard: "Tổng quan",
    products: "Sản phẩm",
    new: "Thêm mới",
    orders: "Đơn hàng",
    payments: "Thanh toán",
    shipping: "Vận chuyển",
    customers: "Khách hàng",
    banners: "Banner & Slider",
    "page-builder": "Xây dựng trang",
    users: "Nhân viên",
    "audit-log": "Nhật ký"
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md transition-all">
      {/* Left: Breadcrumbs & Quick Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-brand-forest transition-colors"
          >
            Admin
          </Link>
          {pathSegments.map((seg, idx) => (
            <span key={seg} className="flex items-center gap-2">
              <span>/</span>
              <span
                className={
                  idx === pathSegments.length - 1
                    ? "font-bold text-ink capitalize"
                    : "hover:text-brand-forest transition-colors"
                }
              >
                {breadcrumbNameMap[seg] || seg}
              </span>
            </span>
          ))}
        </div>

        {/* Global Quick Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex items-center w-full max-w-xs"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đơn hàng, khách hàng..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-8 text-xs font-medium text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none transition-all shadow-xs"
          />
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </form>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* View Storefront Link */}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-brand-forest hover:text-brand-forest hover:bg-mint-50/40 transition-all shadow-xs"
        >
          <span>Xem website</span>
          <ExternalLink size={13} className="text-slate-400" />
        </a>

        {/* New Product Quick Action */}
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Thêm sản phẩm</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-ink transition-colors"
            aria-label="Thông báo"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest font-bold text-xs text-white shadow-xs">
              {initial}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-ink leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] font-semibold uppercase text-brand-forest tracking-wider">
                {role}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-xs font-bold text-ink">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <KeyRound size={14} className="text-slate-400" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <a
                    href={SITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>Mở storefront</span>
                  </a>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-sale hover:bg-sale-light/40 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        isSelf={true}
      />
    </header>
  );
}

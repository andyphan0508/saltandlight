"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenuStore } from "@/lib/mobile-menu-store";
import { NAV_LEFT, NAV_RIGHT } from "@/lib/nav-items";
import { X, ChevronRight, Truck, Phone, Shirt, ShoppingBag, ShieldCheck } from "./Icons";

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function MobileDrawer({ categories }: { categories: CategoryNavItem[] }) {
  const pathname = usePathname();
  const open = useMobileMenuStore((s) => s.open);
  const setOpen = useMobileMenuStore((s) => s.setOpen);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Lock body scroll when BottomSheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Dimmed Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* BottomSheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng di động"
        className="relative z-10 flex max-h-[88vh] w-full flex-col rounded-t-[32px] bg-[#FDFBF7] shadow-[0_-16px_50px_rgba(0,0,0,0.25)] border-t border-ink/10 animate-sheet-up overflow-hidden"
      >
        {/* Drag Pill Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-pointer flex-shrink-0"
          onClick={() => setOpen(false)}
        >
          <div className="h-1.5 w-12 rounded-full bg-ink/20 hover:bg-ink/40 transition-colors" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between border-b border-ink/5 px-6 pb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-28">
              <Image
                src="/images/logo.png"
                alt="Salt & Light"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <span className="rounded-full bg-brand-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-forest">
              Menu
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/70 hover:bg-ink/10 active-press"
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto native-scroll px-5 py-4 space-y-5">
          {/* Quick Category Grid */}
          {categories.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-ink/50">
                  Khám phá danh mục
                </span>
                <Link
                  href="/san-pham"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold text-brand-forest hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/san-pham"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white p-3 shadow-xs active-press"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-mint-100 text-brand-forest">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink truncate">Tất cả sản phẩm</p>
                    <p className="text-[10px] text-ink/40">Bộ sưu tập</p>
                  </div>
                </Link>

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/san-pham?categories=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white p-3 shadow-xs active-press"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <Shirt size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{c.name}</p>
                      <p className="text-[10px] text-ink/40">{c.count} món</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <div className="mb-1.5 px-1 text-[11px] font-black uppercase tracking-wider text-ink/50">
              Điều hướng chính
            </div>

            {[...NAV_LEFT, ...NAV_RIGHT].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all active-press ${
                    active
                      ? "bg-ink text-white shadow-sm"
                      : "bg-white border border-ink/5 text-ink/80 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} className={active ? "text-white" : "text-ink/30"} />
                </Link>
              );
            })}
          </div>

          {/* Customer Service & Policies */}
          <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3 shadow-xs">
            <div className="text-[11px] font-black uppercase tracking-wider text-ink/50">
              Dịch vụ &amp; Hỗ trợ
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <Link
                href="/tra-cuu-don-hang"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-2 py-1.5 font-semibold text-ink hover:bg-mint-50 transition-colors active-press"
              >
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-brand-forest" />
                  <span>Tra cứu hành trình đơn hàng</span>
                </div>
                <ChevronRight size={14} className="text-ink/30" />
              </Link>

              <Link
                href="/chinh-sach"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-2 py-1.5 font-semibold text-ink hover:bg-mint-50 transition-colors active-press"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-brand-forest" />
                  <span>Chính sách đổi trả 7 ngày</span>
                </div>
                <ChevronRight size={14} className="text-ink/30" />
              </Link>

              <a
                href="tel:0847252025"
                className="flex items-center justify-between rounded-xl px-2 py-1.5 font-semibold text-ink hover:bg-mint-50 transition-colors active-press"
              >
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-brand-forest" />
                  <span>Hotline: 0847 25 2025</span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Gọi ngay
                </span>
              </a>
            </div>
          </div>

          {/* Scripture blessing quote */}
          <div className="text-center py-2">
            <p className="text-[11px] italic text-ink/50">
              &ldquo;Các con là muối của đất... là ánh sáng của thế gian.&rdquo;
            </p>
            <p className="text-[10px] font-semibold text-brand-forest/60 mt-0.5">
              — Ma-thi-ơ 5:13-14
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

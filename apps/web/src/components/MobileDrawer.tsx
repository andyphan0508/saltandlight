"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileMenuStore } from "@/lib/mobile-menu-store";
import { NAV_LEFT, NAV_RIGHT } from "@/lib/nav-items";
import { X, ChevronRight, Truck, Phone } from "./Icons";

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/**
 * Rendered as a sibling of <Header> (not inside it) for the same reason as
 * BottomTabBar — header's `backdrop-blur-md` creates a containing block for
 * `position: fixed` descendants, which would collapse this drawer's
 * `inset-0` overlay down to the header's own (short) box instead of the
 * full viewport.
 */
export function MobileDrawer({ categories }: { categories: CategoryNavItem[] }) {
  const pathname = usePathname();
  const open = useMobileMenuStore((s) => s.open);
  const setOpen = useMobileMenuStore((s) => s.setOpen);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setOpen(false)}
      />

      <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-cream p-6 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div className="relative h-9 w-32">
            <Image src="/images/logo.png" alt="Salt & Light" fill className="object-contain object-left" />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-ink/60 hover:bg-ink/5"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto space-y-1.5 pr-1">
          {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive(item.href) ? "bg-ink text-white shadow-sm" : "text-ink/80 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight size={16} className={isActive(item.href) ? "text-white" : "text-ink/30"} />
            </Link>
          ))}

          {categories.length > 0 && (
            <div className="pt-2">
              <div className="px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink/40">
                Danh mục
              </div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/san-pham?categories=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
                >
                  <span>{c.name}</span>
                  <ChevronRight size={14} className="text-ink/30" />
                </Link>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-ink/10 mt-3 space-y-1.5">
            <Link
              href="/chinh-sach"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-ink/5"
            >
              <span>Chính sách đổi trả 7 ngày</span>
              <ChevronRight size={14} className="text-ink/30" />
            </Link>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-4 space-y-3 text-xs text-ink/70">
          <Link
            href="/tra-cuu-don-hang"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-bold uppercase text-ink hover:text-brand-forest"
          >
            <Truck size={16} />
            <span>Tra cứu đơn hàng</span>
          </Link>
          <div className="flex items-center gap-2">
            <Phone size={15} />
            <span>Hotline: 0847 25 2025</span>
          </div>
          <p className="text-[11px] text-ink/50 pt-1">
            &ldquo;Các con là muối của đất... là ánh sáng của thế gian.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

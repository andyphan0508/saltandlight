"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, Package, ShoppingCart, TrendingUp, Wallet, X } from "./Icons";
import { isNavActive, navGroupsFor } from "./nav-config";

/** The four jobs an admin does from a phone; everything else lives behind "Thêm". */
const TABS = [
  { href: "/admin/dashboard", label: "Thống kê", icon: TrendingUp, also: ["/admin/analytics"] },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart, also: [] },
  { href: "/admin/payments", label: "Thanh toán", icon: Wallet, also: [] },
  { href: "/admin/products", label: "Sản phẩm", icon: Package, also: [] },
];

const TAB_CLASS = "flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";

const TabIcon = ({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => (
  <span
    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
      isActive ? "bg-slate-900 text-emerald-300" : "text-slate-500"
    }`}
  >
    {children}
  </span>
);

/** Phone and tablet navigation for the admin. Hidden from `lg`, where the sidebar takes over. */
export const MobileTabBar = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDialogElement>(null);

  // Following a link in the sheet navigates; close it once the new page is there
  useEffect(() => {
    sheetRef.current?.close();
  }, [pathname]);

  const activeTab = TABS.find((t) => [t.href, ...t.also].some((href) => isNavActive(pathname, href)));

  return (
    <>
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`${TAB_CLASS} ${isActive ? "text-slate-900" : "text-slate-500"}`}
            >
              <TabIcon isActive={isActive}>
                <tab.icon size={19} />
              </TabIcon>
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => sheetRef.current?.showModal()}
          className={`${TAB_CLASS} ${activeTab ? "text-slate-500" : "text-slate-900"}`}
        >
          <TabIcon isActive={!activeTab}>
            <Menu size={19} />
          </TabIcon>
          Thêm
        </button>
      </nav>

      <dialog
        ref={sheetRef}
        aria-label="Tất cả mục quản lý"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="admin-sheet fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 pb-[env(safe-area-inset-bottom)] backdrop:bg-slate-900/40 lg:hidden"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
          <h2 className="text-sm font-bold text-slate-900">Tất cả mục quản lý</h2>
          <button
            type="button"
            onClick={() => sheetRef.current?.close()}
            aria-label="Đóng"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-4 py-4">
          {navGroupsFor(role).map((group) => (
            <section key={group.label}>
              <h3 className="px-1 pb-2 text-xs font-semibold text-slate-500">{group.label}</h3>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map((item) => {
                  const isActive = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center text-[11px] font-semibold leading-tight ${
                        isActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 active:bg-slate-100"
                      }`}
                    >
                      <item.icon size={20} className={isActive ? "text-emerald-300" : "text-slate-500"} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </dialog>
    </>
  );
};

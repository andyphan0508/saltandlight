"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
} from "./Icons";

const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: (props: { size?: number; className?: string }) => JSX.Element }[];
}[] = [
  {
    label: "Tổng quan",
    items: [{ href: "/dashboard", label: "Bảng điều khiển", icon: LayoutGrid }],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/products", label: "Sản phẩm", icon: Package },
      { href: "/orders", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/payments", label: "Thanh toán", icon: Wallet },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/shipping", label: "Vận chuyển", icon: Truck },
      { href: "/customers", label: "Khách hàng", icon: Users },
    ],
  },
];

const OWNER_GROUP = {
  label: "Quản trị",
  items: [
    { href: "/users", label: "Nhân viên", icon: UserCog },
    { href: "/audit-log", label: "Nhật ký hoạt động", icon: History },
  ],
};

export function Sidebar({ role, email, fullName }: { role: string; email: string; fullName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const groups = role === "owner" ? [...NAV_GROUPS, OWNER_GROUP] : NAV_GROUPS;
  const displayName = fullName || email.split("@")[0] || email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-ink/10 bg-white">
      <div className="flex items-center gap-2.5 border-b border-ink/10 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-black text-white">
          S&amp;L
        </div>
        <div>
          <div className="font-display text-sm font-black uppercase leading-none">Salt &amp; Light</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/40">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-ink/35">
              {group.label}
            </div>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-ink text-white shadow-sm"
                        : "text-ink/60 hover:bg-mint-50 hover:text-ink"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={active ? "text-white" : "text-ink/40 group-hover:text-brand-forest"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-mint-50 px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-ink">{displayName}</div>
            <div className="truncate text-[10px] capitalize text-ink/45">{role}</div>
          </div>
          <button
            onClick={signOut}
            aria-label="Đăng xuất"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-ink/40 hover:bg-white hover:text-sale"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

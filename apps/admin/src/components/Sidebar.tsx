"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/orders", label: "Đơn hàng" },
  { href: "/payments", label: "Thanh toán" },
  { href: "/shipping", label: "Vận chuyển" },
  { href: "/customers", label: "Khách hàng" },
];

const OWNER_NAV = [
  { href: "/users", label: "Nhân viên" },
  { href: "/audit-log", label: "Nhật ký hoạt động" },
];

export function Sidebar({ role, email }: { role: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const items = role === "owner" ? [...NAV, ...OWNER_NAV] : NAV;

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-ink/10 bg-white">
      <div className="border-b border-ink/10 px-6 py-5 font-display text-lg font-black uppercase">
        Salt &amp; Light
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-4 py-2.5 text-sm font-medium ${
                active ? "bg-ink text-white" : "text-ink/70 hover:bg-mint-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink/10 px-4 py-4">
        <div className="truncate text-xs text-ink/50">{email}</div>
        <button onClick={signOut} className="mt-2 text-xs font-semibold uppercase text-ink/60 hover:text-ink">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

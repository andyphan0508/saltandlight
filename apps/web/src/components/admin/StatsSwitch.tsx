import Link from "next/link";

const VIEWS = [
  { href: "/admin/dashboard", label: "Bán hàng" },
  { href: "/admin/analytics", label: "Lượt truy cập" },
];

/**
 * The "Thống kê" tab covers two pages; on phones this switches between them in
 * one tap instead of a trip through the menu. Desktop has both in the sidebar.
 */
export const StatsSwitch = ({ current }: { current: "/admin/dashboard" | "/admin/analytics" }) => (
  <nav aria-label="Loại thống kê" className="grid grid-cols-2 gap-1 rounded-full bg-slate-200/70 p-1 lg:hidden">
    {VIEWS.map((view) => (
      <Link
        key={view.href}
        href={view.href}
        aria-current={view.href === current ? "page" : undefined}
        className={`rounded-full py-2 text-center text-sm font-semibold transition-colors ${
          view.href === current ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
        }`}
      >
        {view.label}
      </Link>
    ))}
  </nav>
);

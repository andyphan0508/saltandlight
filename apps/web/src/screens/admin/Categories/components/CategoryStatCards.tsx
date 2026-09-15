"use client";

import { LayoutGrid, Package, Tag } from "@/components/admin/Icons";
import type { CategoryStats } from "@/interfaces/category";

/** Category totals: all categories, categorised products and top-level categories. */
export const CategoryStatCards = ({ stats }: { stats: CategoryStats }) => {
  const cards = [
    { value: stats.totalCategories, label: "Tổng số danh mục", icon: LayoutGrid, iconClass: "bg-mint-100 text-brand-forest" },
    { value: stats.totalProducts, label: "Sản phẩm đã phân loại", icon: Package, iconClass: "bg-amber-100 text-amber-800" },
    { value: stats.topLevelCategories, label: "Danh mục chính (Cấp 1)", icon: Tag, iconClass: "bg-blue-100 text-blue-800" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ value, label, icon: Icon, iconClass }) => (
        <div key={label} className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs font-semibold text-slate-500">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

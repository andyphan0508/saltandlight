import Link from "next/link";
import type { CategoryOption } from "@/interfaces/catalog";
import { Shirt, ShoppingBag } from "../Icons";

interface DrawerCategoryGridProps {
  categories: CategoryOption[];
  onNavigate: () => void;
}

const tileClass = "flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white p-3 shadow-xs active-press";

/** Two-column grid: "all products" plus one tile per category. */
export const DrawerCategoryGrid = ({ categories, onNavigate }: DrawerCategoryGridProps) => {
  if (categories.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Khám phá danh mục</span>
        <Link href="/san-pham" onClick={onNavigate} className="text-xs font-bold text-brand-forest hover:underline">
          Xem tất cả
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/san-pham" onClick={onNavigate} className={tileClass}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-mint-100 text-brand-forest">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink truncate">Tất cả sản phẩm</p>
            <p className="text-[10px] text-ink/40">Bộ sưu tập</p>
          </div>
        </Link>

        {categories.map((category) => (
          <Link key={category.id} href={`/san-pham?categories=${category.slug}`} onClick={onNavigate} className={tileClass}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Shirt size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink truncate">{category.name}</p>
              <p className="text-[10px] text-ink/40">{category.count} món</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { LayoutGrid, Plus } from "@/components/admin/Icons";
import { Pagination } from "@/components/admin/Pagination";
import type { CategoryItem, CategoryStats, ParentCategoryOption } from "@/interfaces/category";
import { CategoryFormModal } from "./CategoryFormModal";
import { CategoryRow } from "./CategoryRow";
import { CategorySearchBar } from "./CategorySearchBar";
import { CategoryStatCards } from "./CategoryStatCards";

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
  parentOptions: ParentCategoryOption[];
  total: number;
  page: number;
  pageSize: number;
  currentQ: string;
  stats: CategoryStats;
}

/** Product categories: totals, search, table with delete; create and edit open CategoryFormModal. */
export const CategoryManager = ({
  initialCategories,
  parentOptions,
  total,
  page,
  pageSize,
  currentQ,
  stats,
}: CategoryManagerProps) => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  // null = form closed; { category: null } = creating
  const [formTarget, setFormTarget] = useState<{ category: CategoryItem | null } | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const onSearch = (query: string) =>
    router.push(query.trim() ? `/admin/categories?q=${encodeURIComponent(query.trim())}` : "/admin/categories");

  const onSaved = (saved: CategoryItem) => {
    setCategories((prev) =>
      prev.some((c) => c.id === saved.id) ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev],
    );
    setFormTarget(null);
    router.refresh();
  };

  const onDelete = async (category: CategoryItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await adminFetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success("Đã xóa danh mục!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Danh Mục Sản Phẩm</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tạo và phân loại danh mục, bộ sưu tập theo mùa để người mua dễ dàng khám phá sản phẩm.
          </p>
        </div>
        <Button
          onClick={() => setFormTarget({ category: null })}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
        >
          <Plus size={16} />
          <span>Thêm danh mục mới</span>
        </Button>
      </div>

      <CategoryStatCards stats={stats} />

      <CategorySearchBar query={currentQ} onSearch={onSearch} />

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Tên danh mục</th>
                <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                <th className="py-3.5 px-4">Danh mục cha</th>
                <th className="py-3.5 px-4 text-center">Số sản phẩm</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <LayoutGrid size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs sm:text-sm">
                      {currentQ ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nào được tạo"}
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={() => setFormTarget({ category })}
                    onDelete={() => onDelete(category)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/categories" searchParams={{ q: currentQ || undefined }} />
        </div>
      </div>

      {formTarget && (
        <CategoryFormModal
          key={formTarget.category?.id ?? "new"}
          category={formTarget.category}
          parentOptions={parentOptions}
          onClose={() => setFormTarget(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

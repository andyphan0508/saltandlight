"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Package,
  ExternalLink,
  Tag,
  LayoutGrid,
} from "@/components/admin/Icons";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { products: number };
}

export function CategoryManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenCreate() {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("");
    setIsCustomSlug(false);
    setIsCreating(true);
  }

  function handleOpenEdit(cat: CategoryItem) {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parentId || "");
    setIsCustomSlug(true);
    setIsCreating(false);
  }

  function handleCloseModal() {
    setIsCreating(false);
    setEditingCategory(null);
  }

  function handleNameChange(val: string) {
    setFormName(val);
    if (!isCustomSlug) {
      setFormSlug(slugify(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";
      const body = {
        name: formName.trim(),
        slug: formSlug.trim() ? slugify(formSlug) : slugify(formName),
        parentId: formParentId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi lưu danh mục");
      }

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? data.category : c))
        );
        toast.success("Cập nhật danh mục thành công!");
      } else {
        setCategories((prev) => [data.category, ...prev]);
        toast.success("Tạo danh mục mới thành công!");
      }
      handleCloseModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(cat: CategoryItem) {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Thao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa danh mục");
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Đã xóa danh mục!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xóa";
      toast.error(msg);
    }
  }

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.parent?.name && c.parent.name.toLowerCase().includes(q))
    );
  });

  const totalProducts = categories.reduce(
    (sum, c) => sum + (c._count?.products || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tạo và phân loại danh mục, bộ sưu tập theo mùa để người mua dễ dàng khám phá sản phẩm.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
        >
          <Plus size={16} />
          <span>Thêm danh mục mới</span>
        </Button>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-100 text-brand-forest">
            <LayoutGrid size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{categories.length}</div>
            <div className="text-xs font-semibold text-slate-500">Tổng số danh mục</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Package size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalProducts}</div>
            <div className="text-xs font-semibold text-slate-500">Sản phẩm đã phân loại</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
            <Tag size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {categories.filter((c) => !c.parentId).length}
            </div>
            <div className="text-xs font-semibold text-slate-500">Danh mục chính (Cấp 1)</div>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-200/80 shadow-xs">
        <Search size={18} className="text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm danh mục theo tên, đường dẫn (slug) hoặc danh mục cha..."
          className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 4. Category Table / List */}
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <LayoutGrid size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs sm:text-sm">
                      {search ? "Không tìm thấy danh mục phù hợp" : "Chưa có danh mục nào được tạo"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 pl-6 pr-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint-50 text-brand-forest font-bold text-xs">
                          {cat.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {cat.parent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Danh mục gốc</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        href={`/admin/products`}
                        title="Xem sản phẩm thuộc danh mục này"
                        className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-0.5 text-xs font-bold text-brand-forest hover:bg-mint-200 transition-colors"
                      >
                        <Package size={13} />
                        <span>{cat._count?.products ?? 0}</span>
                      </Link>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/san-pham?categories=${cat.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Xem trên cửa hàng"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-forest hover:bg-mint-50 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          title="Xóa danh mục"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Category Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-pop-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục sản phẩm mới"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tên danh mục sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Áo Thun Cơ Đốc, Set Quà Mùa Lễ..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-forest focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Đường dẫn liên kết (Slug)
                  </label>
                  {!isCustomSlug && (
                    <span className="text-[11px] text-brand-forest font-semibold">
                      Tự động điền theo tên
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => {
                    setFormSlug(e.target.value);
                    setIsCustomSlug(true);
                  }}
                  placeholder="ao-thun-co-doc"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:border-brand-forest focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Đường dẫn xem trên cửa hàng: <code className="text-slate-600">/san-pham?categories={formSlug || "..."}</code>
                </p>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thuộc danh mục cha (Không bắt buộc)
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:border-brand-forest focus:outline-none"
                >
                  <option value="">-- Không thuộc danh mục nào (Đây là danh mục chính) --</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Dùng khi bạn muốn tạo nhóm sản phẩm con (Ví dụ: Áo Thun &gt; Áo Thun Giáng Sinh).
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : editingCategory
                    ? "Cập nhật danh mục"
                    : "Tạo danh mục"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

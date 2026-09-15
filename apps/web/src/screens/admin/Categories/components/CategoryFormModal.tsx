"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Modal } from "@/components/Modal";
import { X } from "@/components/admin/Icons";
import { slugify } from "@/helpers/slugify";
import type { CategoryItem, ParentCategoryOption } from "@/interfaces/category";

const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-700";
const inputClass = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none";

interface CategoryFormModalProps {
  /** The category to edit, or null to create one. */
  category: CategoryItem | null;
  parentOptions: ParentCategoryOption[];
  onClose: () => void;
  onSaved: (category: CategoryItem) => void;
}

/** Create/edit category form. The slug follows the name until it is edited by hand. Mounted once per open. */
export const CategoryFormModal = ({ category, parentOptions, onClose, onSaved }: CategoryFormModalProps) => {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(category));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onNameChange = (value: string) => {
    setName(value);
    if (!isCustomSlug) setSlug(slugify(value));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await adminFetch<{ category: CategoryItem }>(
        category ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
        {
          method: category ? "PATCH" : "POST",
          body: { name: name.trim(), slug: slug.trim() ? slugify(slug) : slugify(name), parentId: parentId || null },
        },
      );
      toast.success(category ? "Cập nhật danh mục thành công!" : "Tạo danh mục mới thành công!");
      onSaved(data.category);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      labelledBy="category-form-title"
      className="max-w-lg rounded-2xl bg-white border border-slate-200 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <h3 id="category-form-title" className="font-bold text-slate-900 text-sm sm:text-base">
          {category ? "Chỉnh sửa danh mục" : "Tạo danh mục sản phẩm mới"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className={`${labelClass} mb-1.5`}>
            Tên danh mục sản phẩm <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ví dụ: Áo Thun Cơ Đốc, Set Quà Mùa Lễ..."
            required
            className={`${inputClass} text-slate-900`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Đường dẫn liên kết (Slug)</label>
            {!isCustomSlug && <span className="text-[11px] text-brand-forest font-semibold">Tự động điền theo tên</span>}
          </div>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsCustomSlug(true);
            }}
            placeholder="ao-thun-co-doc"
            className={`${inputClass} font-mono text-slate-800`}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Đường dẫn xem trên cửa hàng: <code className="text-slate-600">/san-pham?categories={slug || "..."}</code>
          </p>
        </div>

        <div>
          <label className={`${labelClass} mb-1.5`}>Thuộc danh mục cha (Không bắt buộc)</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={`${inputClass} text-slate-900 bg-white`}>
            <option value="">-- Không thuộc danh mục nào (Đây là danh mục chính) --</option>
            {parentOptions
              .filter((option) => option.id !== category?.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Dùng khi bạn muốn tạo nhóm sản phẩm con (Ví dụ: Áo Thun &gt; Áo Thun Giáng Sinh).
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold">
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
          >
            {isSubmitting ? "Đang lưu..." : category ? "Cập nhật danh mục" : "Tạo danh mục"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

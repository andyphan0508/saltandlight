"use client";

import Link from "next/link";
import { ExternalLink, Package, Pencil, Trash2 } from "@/components/admin/Icons";
import type { CategoryItem } from "@/interfaces/category";

interface CategoryRowProps {
  category: CategoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

/** One category: name, slug, parent, product count and storefront / edit / delete actions. */
export const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => (
  <tr className="hover:bg-slate-50/60 transition-colors">
    <td className="py-4 pl-6 pr-4 font-bold text-slate-900">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint-50 text-brand-forest font-bold text-xs">
          {category.name.charAt(0).toUpperCase()}
        </span>
        <span>{category.name}</span>
      </div>
    </td>
    <td className="py-4 px-4 text-slate-500 font-mono text-xs">
      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{category.slug}</span>
    </td>
    <td className="py-4 px-4 text-slate-600">
      {category.parent ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {category.parent.name}
        </span>
      ) : (
        <span className="text-slate-400 italic text-xs">Danh mục gốc</span>
      )}
    </td>
    <td className="py-4 px-4 text-center">
      <Link
        href={`/admin/products?category=${category.id}`}
        title="Xem sản phẩm thuộc danh mục này"
        className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-0.5 text-xs font-bold text-brand-forest hover:bg-mint-200 transition-colors"
      >
        <Package size={13} />
        <span>{category._count?.taggedProducts ?? 0}</span>
      </Link>
    </td>
    <td className="py-4 pr-6 pl-4 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <a
          href={`/san-pham?categories=${category.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Xem trên cửa hàng"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
        <button
          type="button"
          onClick={onEdit}
          title="Chỉnh sửa"
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-forest hover:bg-mint-50 transition-colors"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Xóa danh mục"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

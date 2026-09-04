"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import {
  Plus,
  Trash2,
  Upload,
  ImagePlus,
  Percent,
  GripVertical,
  Package,
  Tag,
} from "./Icons";

interface Category {
  id: string;
  name: string;
}

interface VariantRow {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  isActive: boolean;
}

interface ImageRow {
  url: string;
  sortOrder: number;
}

export interface ProductFormInitial {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  status: "draft" | "published" | "archived";
  isNew: boolean;
  isFeatured?: boolean;
  images: ImageRow[];
  variants: VariantRow[];
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function skuify(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p) => slugify(p).toUpperCase())
    .join("-");
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none";
const cellClass =
  "w-full rounded-lg border border-ink/10 px-2.5 py-1.5 text-xs focus:border-brand-forest focus:outline-none";

const emptyVariant: VariantRow = {
  sku: "",
  color: "",
  size: "",
  price: 0,
  compareAtPrice: null,
  stockQuantity: 0,
  isActive: true,
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [images, setImages] = useState<ImageRow[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants ?? [{ ...emptyVariant }],
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quickColors, setQuickColors] = useState("");
  const [quickSizes, setQuickSizes] = useState("");
  const [quickPrice, setQuickPrice] = useState(0);
  const [quickStock, setQuickStock] = useState(50);
  const [discountPct, setDiscountPct] = useState(20);

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  // ── Images: multi-upload + drag reorder ──────────────────────────
  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingCount(files.length);
    setError(null);

    const uploaded: ImageRow[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Tải ảnh thất bại");
        uploaded.push({ url: data.url, sortOrder: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
      }
      setUploadingCount((n) => Math.max(0, n - 1));
    }
    setImages((prev) => [...prev, ...uploaded].map((img, i) => ({ ...img, sortOrder: i })));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })));
  }

  function reorderImages(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }

  // ── Quick variant generator (Color × Size) ───────────────────────
  function generateVariants() {
    const colors = quickColors.split(",").map((c) => c.trim()).filter(Boolean);
    const sizes = quickSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const combos: { color: string; size: string }[] = [];
    if (colors.length && sizes.length) {
      for (const color of colors) for (const size of sizes) combos.push({ color, size });
    } else if (colors.length) {
      for (const color of colors) combos.push({ color, size: "" });
    } else if (sizes.length) {
      for (const size of sizes) combos.push({ color: "", size });
    } else {
      return;
    }

    const generated: VariantRow[] = combos.map((c) => ({
      sku: skuify(slug || name, c.color, c.size) || `SKU-${Math.random().toString(36).slice(2, 7)}`,
      color: c.color,
      size: c.size,
      price: quickPrice,
      compareAtPrice: null,
      stockQuantity: quickStock,
      isActive: true,
    }));

    setVariants((prev) => {
      const isBlank = prev.length === 1 && !prev[0]!.sku && !prev[0]!.color && !prev[0]!.size;
      return isBlank ? generated : [...prev, ...generated];
    });
  }

  // ── Quick discount tool ───────────────────────────────────────────
  function applyDiscount() {
    setVariants((prev) =>
      prev.map((v) => {
        const base = v.compareAtPrice ?? v.price;
        if (!base) return v;
        return { ...v, compareAtPrice: base, price: Math.round((base * (1 - discountPct / 100)) / 1000) * 1000 };
      }),
    );
  }

  function clearDiscount() {
    setVariants((prev) =>
      prev.map((v) => (v.compareAtPrice ? { ...v, price: v.compareAtPrice, compareAtPrice: null } : v)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      slug,
      description,
      categoryId: categoryId || null,
      status,
      isNew,
      isFeatured,
      images,
      variants: variants.map((v) => ({
        ...v,
        color: v.color || null,
        size: v.size || null,
        compareAtPrice: v.compareAtPrice || null,
      })),
    };

    const res = await fetch(initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
      return;
    }
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Section title="Thông tin cơ bản" icon={<Package size={16} />}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tên sản phẩm" required>
            <input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="VD: Áo Thun FEARLESS"
            />
          </Field>
          <Field label="Slug (URL)" required>
            <input
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>
          <Field label="Danh mục">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">— Không có —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
              <option value="draft">Nháp</option>
              <option value="published">Đang bán</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Mô tả sản phẩm">
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Câu Kinh Thánh, chất liệu, kỹ thuật in, hướng dẫn bảo quản…"
              />
              <div className="mt-1 text-right text-[11px] text-ink/35">{description.length} ký tự</div>
            </Field>
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-forest"
              />
              Gắn nhãn &quot;NEW&quot; trên trang sản phẩm
            </label>

            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs hover:bg-amber-100/70 transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500"
              />
              <span>★ Sản phẩm nổi bật (Ưu tiên hiển thị trang chủ)</span>
            </label>
          </div>
        </div>
      </Section>

      {/* Images */}
      <Section title="Ảnh sản phẩm" icon={<ImagePlus size={16} />} badge={`${images.length} ảnh`}>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div
              key={img.url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== i) reorderImages(dragIndex, i);
                setDragIndex(null);
              }}
              className="group relative h-28 w-28 cursor-grab overflow-hidden rounded-xl border border-ink/10 bg-mint-50 active:cursor-grabbing"
            >
              <Image src={img.url} alt="" fill className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  Ảnh chính
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical size={14} className="text-white/70" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-ink hover:bg-sale hover:text-white"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}

          <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 text-ink/40 transition-colors hover:border-brand-forest hover:text-brand-forest">
            {uploadingCount > 0 ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-[10px] font-semibold">Đang tải {uploadingCount}…</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span className="text-[10px] font-semibold">Thêm ảnh</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-ink/40">
          Chọn nhiều ảnh cùng lúc, kéo-thả để sắp xếp lại thứ tự. Ảnh đầu tiên là ảnh đại diện.
        </p>
      </Section>

      {/* Quick discount tool */}
      <Section title="Áp giảm giá nhanh" icon={<Percent size={16} />}>
        <p className="text-xs text-ink/45">
          Áp dụng % giảm cho toàn bộ biến thể — giá gốc sẽ giữ ở &quot;Giá so sánh&quot;, giá bán mới tự động tính lại.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="% giảm giá" className="w-32">
            <div className="relative">
              <input
                type="number"
                min={1}
                max={90}
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className={`${inputClass} pr-7`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40">
                %
              </span>
            </div>
          </Field>
          <Button type="button" size="sm" variant="secondary" onClick={applyDiscount}>
            Áp dụng cho tất cả
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={clearDiscount}>
            Bỏ giảm giá
          </Button>
        </div>
      </Section>

      {/* Quick variant generator */}
      <Section title="Tạo nhanh biến thể" icon={<Tag size={16} />}>
        <p className="text-xs text-ink/45">
          Nhập danh sách màu và size (cách nhau bằng dấu phẩy) để tự sinh toàn bộ tổ hợp biến thể.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Màu sắc" className="sm:col-span-1">
            <input
              value={quickColors}
              onChange={(e) => setQuickColors(e.target.value)}
              placeholder="Đen, Trắng"
              className={inputClass}
            />
          </Field>
          <Field label="Size" className="sm:col-span-1">
            <input
              value={quickSizes}
              onChange={(e) => setQuickSizes(e.target.value)}
              placeholder="S, M, L, XL"
              className={inputClass}
            />
          </Field>
          <Field label="Giá bán" className="sm:col-span-1">
            <input
              type="number"
              value={quickPrice}
              onChange={(e) => setQuickPrice(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Tồn kho mỗi biến thể" className="sm:col-span-1">
            <input
              type="number"
              value={quickStock}
              onChange={(e) => setQuickStock(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <Button type="button" size="sm" className="mt-3" onClick={generateVariants}>
          <Plus size={14} /> Tạo biến thể
        </Button>
      </Section>

      {/* Variants table */}
      <Section
        title="Biến thể"
        icon={<Tag size={16} />}
        badge={`${variants.length} biến thể`}
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setVariants((prev) => [...prev, { ...emptyVariant }])}
          >
            <Plus size={14} /> Thêm dòng
          </Button>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-xs">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-left uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-3 py-2.5 font-semibold">SKU</th>
                <th className="px-3 py-2.5 font-semibold">Màu</th>
                <th className="px-3 py-2.5 font-semibold">Size</th>
                <th className="px-3 py-2.5 font-semibold">Giá bán</th>
                <th className="px-3 py-2.5 font-semibold">Giá so sánh</th>
                <th className="px-3 py-2.5 font-semibold">Tồn kho</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {variants.map((v, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <input
                      value={v.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      required
                      className={`${cellClass} font-mono`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className={cellClass} />
                  </td>
                  <td className="px-3 py-2">
                    <input value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className={cellClass} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                      required
                      className={cellClass}
                    />
                    <div className="mt-0.5 text-[10px] text-ink/35">{formatVND(v.price)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={v.compareAtPrice ?? ""}
                      onChange={(e) =>
                        updateVariant(i, { compareAtPrice: e.target.value ? Number(e.target.value) : null })
                      }
                      className={cellClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={v.stockQuantity}
                      onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })}
                      required
                      className={`${cellClass} ${v.stockQuantity <= 5 ? "text-sale font-semibold" : ""}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-ink/30 hover:text-sale"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {error && (
        <div className="rounded-xl border border-sale/20 bg-sale-light/40 p-3 text-sm text-sale">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu…" : initial?.id ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  icon,
  badge,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-brand-forest">{icon}</span>}
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink/70">{title}</h2>
          {badge && (
            <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
        {label} {required && <span className="text-sale">*</span>}
      </label>
      {children}
    </div>
  );
}

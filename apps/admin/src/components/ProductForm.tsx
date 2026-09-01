"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@saltandlight/ui";

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
  const [images, setImages] = useState<ImageRow[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants ?? [{ ...emptyVariant }],
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Tải ảnh thất bại");
      return;
    }
    setImages((prev) => [...prev, { url: data.url, sortOrder: prev.length }]);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setError(JSON.stringify(data.error));
      return;
    }
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 rounded-2xl border border-ink/10 bg-white p-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Tên sản phẩm</label>
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
          >
            <option value="">— Không có —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
          >
            <option value="draft">Nháp</option>
            <option value="published">Đang bán</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-ink/60">Mô tả</label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          Gắn nhãn &quot;NEW&quot;
        </label>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <h2 className="text-sm font-bold uppercase text-ink/60">Ảnh sản phẩm</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.url} className="relative h-24 w-24 overflow-hidden rounded-xl bg-mint-100">
              <Image src={img.url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-ink/20 text-xs text-ink/50">
            {uploading ? "Đang tải…" : "+ Thêm ảnh"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-ink/60">Biến thể (màu/size)</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setVariants((prev) => [...prev, { ...emptyVariant }])}
          >
            + Thêm biến thể
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 rounded-xl border border-ink/10 p-3">
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                required
                className="col-span-2 rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
              />
              <input
                placeholder="Màu"
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
              />
              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                placeholder="Giá"
                value={v.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                required
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                placeholder="Giá gốc"
                value={v.compareAtPrice ?? ""}
                onChange={(e) =>
                  updateVariant(i, { compareAtPrice: e.target.value ? Number(e.target.value) : null })
                }
                className="rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Tồn kho"
                  value={v.stockQuantity}
                  onChange={(e) => updateVariant(i, { stockQuantity: Number(e.target.value) })}
                  required
                  className="w-full rounded-lg border border-ink/15 px-2 py-1.5 text-xs"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-ink/40"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-sale">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Đang lưu…" : initial?.id ? "Lưu thay đổi" : "Tạo sản phẩm"}
      </Button>
    </form>
  );
}

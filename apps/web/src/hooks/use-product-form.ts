import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { uploadImage } from "@/api/upload-image";
import { compressImage } from "@/helpers/image-compressor";
import {
  DEFAULT_PRICE_NOTE,
  parseProductContent,
  readPriceNote,
  serializeProductContent,
  withPriceNote,
  type ProductContentBlock,
} from "@/helpers/product-content";
import { applyDiscount, buildVariantCombos, clearDiscount, skuify } from "@/helpers/product-variants";
import { slugify } from "@/helpers/slugify";
import type {
  ColorChoice,
  ImageRow,
  ProductCategoryOption,
  ProductFormInitial,
  PromotionOption,
  VariantRow,
} from "@/interfaces/product-form";

const EMPTY_VARIANT: VariantRow = {
  sku: "",
  color: "",
  colorHex: "",
  size: "",
  price: 0,
  compareAtPrice: null,
  stockQuantity: 0,
  isActive: true,
};

const withSortOrder = (images: ImageRow[]) => images.map((image, i) => ({ ...image, sortOrder: i }));

const randomSuffix = (length: number) => Math.random().toString(36).slice(2, 2 + length);

interface UseProductFormOptions {
  categories: ProductCategoryOption[];
  promotions: PromotionOption[];
  initial?: ProductFormInitial;
}

/** State and actions of the admin product create/edit form. */
export const useProductForm = ({ categories, promotions, initial }: UseProductFormOptions) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? (initial?.name ? slugify(initial.name) : ""));
  const [blocks, setBlocks] = useState<ProductContentBlock[]>(() =>
    parseProductContent(initial?.description).filter((block) => block.type !== "price_note"),
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState<ProductFormInitial["status"]>(initial?.status ?? "draft");
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [images, setImages] = useState<ImageRow[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants ?? [{ ...EMPTY_VARIANT }]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quickColors, setQuickColors] = useState<ColorChoice[]>([]);
  const [quickSizes, setQuickSizes] = useState("XS, S, M, L, XL");
  const [quickPrice, setQuickPrice] = useState(0);
  const [quickStock, setQuickStock] = useState(50);
  const [discountPct, setDiscountPct] = useState(20);
  const [selectedPromotionId, setSelectedPromotionId] = useState("");
  // Promo line shown in the storefront price box ("" hides it)
  const [priceNote, setPriceNote] = useState(
    () => readPriceNote(parseProductContent(initial?.description)) ?? DEFAULT_PRICE_NOTE,
  );

  const onNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const onVariantChange = (index: number, patch: Partial<VariantRow>) =>
    setVariants((prev) => prev.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));

  const onAddVariant = () => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);

  const onRemoveVariant = (index: number) => setVariants((prev) => prev.filter((_, i) => i !== index));

  /** Edits every variant of one color at once — renaming it, recoloring it, or filling its prices. */
  const onGroupChange = (color: string, patch: Partial<VariantRow>) =>
    setVariants((prev) => prev.map((variant) => (variant.color === color ? { ...variant, ...patch } : variant)));

  const onRemoveGroup = (color: string) => setVariants((prev) => prev.filter((variant) => variant.color !== color));

  const onAddVariantToGroup = (color: string, colorHex: string) =>
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT, color, colorHex }]);

  // Multi-upload; every image is compressed to ~200–500 KB WebP first
  const onFilesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingCount(files.length);
    setError(null);

    const uploaded: ImageRow[] = [];
    for (const file of files) {
      try {
        uploaded.push({ url: await uploadImage(await compressImage(file)), sortOrder: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
      }
      setUploadingCount((n) => Math.max(0, n - 1));
    }
    setImages((prev) => withSortOrder([...prev, ...uploaded]));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onRemoveImage = (index: number) => setImages((prev) => withSortOrder(prev.filter((_, i) => i !== index)));

  const onDropImage = (targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      setImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        if (!moved) return prev;
        next.splice(targetIndex, 0, moved);
        return withSortOrder(next);
      });
    }
    setDragIndex(null);
  };

  const onAddQuickColor = (color: ColorChoice) =>
    setQuickColors((prev) =>
      // Same name picked twice = the admin is recoloring it, not adding a duplicate
      prev.some((c) => c.name.toLowerCase() === color.name.toLowerCase())
        ? prev.map((c) => (c.name.toLowerCase() === color.name.toLowerCase() ? color : c))
        : [...prev, color],
    );

  const onRemoveQuickColor = (name: string) => setQuickColors((prev) => prev.filter((c) => c.name !== name));

  const onGenerateVariants = () => {
    const combos = buildVariantCombos(quickColors, quickSizes);
    if (combos.length === 0) return;
    const generated: VariantRow[] = combos.map(({ color, colorHex, size }) => ({
      sku: skuify(slug || name, color, size) || `SKU-${randomSuffix(5)}`,
      color,
      colorHex,
      size,
      price: quickPrice,
      compareAtPrice: null,
      stockQuantity: quickStock,
      isActive: true,
    }));
    setVariants((prev) => {
      const isBlank = prev.length === 1 && !prev[0]!.sku && !prev[0]!.color && !prev[0]!.size;
      if (isBlank) return generated;
      // Re-generating must not duplicate a color × size that already has a price typed into it
      const existing = new Set(prev.map((v) => `${v.color}|${v.size}`));
      return [...prev, ...generated.filter((v) => !existing.has(`${v.color}|${v.size}`))];
    });
  };

  const onApplyDiscount = () => setVariants((prev) => applyDiscount(prev, "percent", discountPct));

  const onClearDiscount = () => setVariants((prev) => clearDiscount(prev));

  const onSelectPromotion = (promotionId: string) => {
    setSelectedPromotionId(promotionId);
    const promotion = promotions.find((p) => p.id === promotionId);
    if (!promotion) return;
    setVariants((prev) => applyDiscount(prev, promotion.discountType, Number(promotion.discountValue)));
    toast.success(`Đã áp dụng ưu đãi từ chương trình: ${promotion.name}`);
  };

  const onClearPromotion = () => {
    setSelectedPromotionId("");
    onClearDiscount();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const finalSlug = slug || slugify(name) || `san-pham-${Date.now()}`;
    const payload = {
      name: name.trim(),
      slug: finalSlug,
      // The promo line is stored with the description blocks, even when empty, so it can be hidden
      description: serializeProductContent(withPriceNote(blocks, priceNote)),
      categoryId: categoryId || null,
      status,
      isNew,
      isFeatured,
      images,
      variants: variants.map((variant, idx) => ({
        ...variant,
        sku:
          variant.sku?.trim() ||
          skuify(finalSlug, variant.color || "", variant.size || "") ||
          `SKU-${idx + 1}-${randomSuffix(4)}`,
        color: variant.color || null,
        colorHex: variant.colorHex || null,
        size: variant.size || null,
        compareAtPrice: variant.compareAtPrice || null,
      })),
    };

    try {
      await adminFetch(initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
        method: initial?.id ? "PATCH" : "POST",
        body: payload,
      });
      toast.success(initial?.id ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm mới thành công!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể lưu thông tin sản phẩm";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fileInputRef,
    name,
    slug,
    blocks,
    categoryId,
    status,
    isNew,
    isFeatured,
    isEditing: Boolean(initial?.id),
    images,
    variants,
    uploadingCount,
    isSaving,
    error,
    quickColors,
    quickSizes,
    quickPrice,
    quickStock,
    discountPct,
    selectedPromotionId,
    priceNote,
    setBlocks,
    setCategoryId,
    setStatus,
    setIsNew,
    setIsFeatured,
    setDragIndex,
    onAddQuickColor,
    onRemoveQuickColor,
    setQuickSizes,
    setQuickPrice,
    setQuickStock,
    setDiscountPct,
    setPriceNote,
    onNameChange,
    onVariantChange,
    onAddVariant,
    onRemoveVariant,
    onGroupChange,
    onRemoveGroup,
    onAddVariantToGroup,
    onFilesChange,
    onRemoveImage,
    onDropImage,
    onGenerateVariants,
    onApplyDiscount,
    onClearDiscount,
    onSelectPromotion,
    onClearPromotion,
    onSubmit,
  };
};

export type ProductFormState = ReturnType<typeof useProductForm>;

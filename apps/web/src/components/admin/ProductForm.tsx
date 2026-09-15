"use client";

import { Button } from "@saltandlight/ui";
import { useProductForm } from "@/hooks/use-product-form";
import type { ProductCategoryOption, ProductFormInitial, PromotionOption } from "@/interfaces/product-form";
import { BasicInfoSection } from "./product-form/BasicInfoSection";
import { DiscountSection } from "./product-form/DiscountSection";
import { ImagesSection } from "./product-form/ImagesSection";
import { PriceNoteSection } from "./product-form/PriceNoteSection";
import { VariantGeneratorSection } from "./product-form/VariantGeneratorSection";
import { VariantsSection } from "./product-form/VariantsSection";

interface ProductFormProps {
  categories: ProductCategoryOption[];
  promotions?: PromotionOption[];
  initial?: ProductFormInitial;
}

/** Admin product create/edit form. State and actions live in useProductForm; each section renders one concern. */
export const ProductForm = ({ categories, promotions = [], initial }: ProductFormProps) => {
  const form = useProductForm({ categories, promotions, initial });

  return (
    <form onSubmit={form.onSubmit} className="space-y-6">
      <BasicInfoSection form={form} categories={categories} />
      <ImagesSection form={form} />
      <DiscountSection form={form} promotions={promotions} />
      <PriceNoteSection form={form} />
      <VariantGeneratorSection form={form} />
      <VariantsSection form={form} />

      {form.error && (
        <div className="rounded-xl border border-sale/20 bg-sale-light/40 p-3 text-sm text-sale">{form.error}</div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={form.isSaving}>
          {form.isSaving ? "Đang lưu…" : form.isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
};

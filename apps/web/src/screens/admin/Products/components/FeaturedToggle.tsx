"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";

export const FeaturedToggle = ({
  productId,
  initialFeatured,
}: {
  productId: string;
  initialFeatured: boolean;
}) => {
  const router = useRouter();
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isLoading, setIsLoading] = useState(false);

  const onToggle = async () => {
    if (isLoading) return;
    const isNextFeatured = !isFeatured;
    setIsFeatured(isNextFeatured); // optimistic update
    setIsLoading(true);

    try {
      await adminFetch(`/api/admin/products/${productId}/featured`, { method: "PATCH", body: { isFeatured: isNextFeatured } });
      toast.success(isNextFeatured ? "Đã bật: Sản phẩm được đưa lên mục Nổi Bật!" : "Đã tắt trạng thái nổi bật");
      router.refresh();
    } catch (err) {
      setIsFeatured(!isNextFeatured); // revert optimistic update
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật trạng thái nổi bật");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFeatured}
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-forest focus:ring-offset-2 ${
        isFeatured ? "bg-emerald-600" : "bg-slate-200"
      } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
      title={isFeatured ? "Đang là Sản phẩm Nổi bật (nhấn để tắt)" : "Nhấn để bật làm Sản phẩm Nổi bật"}
    >
      <span className="sr-only">Toggle featured status</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          isFeatured ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeaturedToggle({
  productId,
  initialFeatured,
}: {
  productId: string;
  initialFeatured: boolean;
}) {
  const router = useRouter();
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    const nextState = !isFeatured;
    setIsFeatured(nextState); // optimistic update
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextState }),
      });

      if (!res.ok) {
        setIsFeatured(!nextState); // revert on error
        const data = await res.json();
        alert(data.error || "Không thể cập nhật trạng thái nổi bật");
      } else {
        router.refresh();
      }
    } catch {
      setIsFeatured(!nextState);
      alert("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isFeatured}
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-forest focus:ring-offset-2 ${
        isFeatured ? "bg-emerald-600" : "bg-slate-200"
      } ${loading ? "opacity-60 cursor-wait" : ""}`}
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
}

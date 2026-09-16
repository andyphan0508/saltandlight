"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Trash2 } from "@/components/admin/Icons";

/**
 * Wraps the (server-rendered) product table in a plain form so selection lives
 * in the checkboxes themselves — no per-row React state, no client-side copy of
 * the product list. `data-select-all` on the header checkbox toggles the rest.
 */
export const BulkDeleteForm = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const getBoxes = () =>
    Array.from(formRef.current?.querySelectorAll<HTMLInputElement>('input[name="ids"]') ?? []);

  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.dataset.selectAll) getBoxes().forEach((b) => (b.checked = target.checked));
    setSelectedCount(getBoxes().filter((b) => b.checked).length);
  };

  const clearSelection = () => {
    formRef.current?.reset();
    setSelectedCount(0);
  };

  const onDelete = async () => {
    const ids = getBoxes().filter((b) => b.checked).map((b) => b.value);
    if (!ids.length || isDeleting) return;
    if (
      !confirm(
        `Xóa vĩnh viễn ${ids.length} sản phẩm khỏi hệ thống? Ảnh và biến thể của sản phẩm cũng bị xóa. Thao tác này không thể hoàn tác.`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      await adminFetch("/api/admin/products", { method: "DELETE", body: { ids } });
      toast.success(`Đã xóa ${ids.length} sản phẩm`);
      clearSelection();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form ref={formRef} onChange={onChange}>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-rose-50/50 px-5 py-3">
          <span className="text-xs font-bold text-slate-700">Đã chọn {selectedCount} sản phẩm</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-ink"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-wait"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? "Đang xóa…" : "Xóa sản phẩm"}</span>
            </button>
          </div>
        </div>
      )}
      {children}
    </form>
  );
};

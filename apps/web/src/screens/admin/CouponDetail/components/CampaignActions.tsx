"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Plus, Trash2, Upload } from "@/components/admin/Icons";

const BUTTON = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold transition-transform active:scale-[0.98] disabled:opacity-60";

/** Pause/resume, issue more codes, download the codes, and delete a campaign nobody has used. */
export const CampaignActions = ({
  campaignId,
  isActive,
  hasUsedCodes,
  remaining,
}: {
  campaignId: string;
  isActive: boolean;
  hasUsedCodes: boolean;
  remaining: number;
}) => {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState("50");
  const [prefix, setPrefix] = useState("");

  const run = async (key: string, action: () => Promise<unknown>, done: string) => {
    setPending(key);
    try {
      await action();
      toast.success(done);
      router.refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      return false;
    } finally {
      setPending(null);
    }
  };

  const onToggle = () =>
    run("toggle", () => adminFetch(`/api/admin/coupons/${campaignId}`, { method: "PATCH", body: { isActive: !isActive } }), isActive ? "Đã tạm dừng đợt mã" : "Đã cho chạy lại đợt mã");

  const onAdd = async () => {
    const count = Number(quantity.replace(/\D/g, "")) || 0;
    const isDone = await run(
      "add",
      () => adminFetch(`/api/admin/coupons/${campaignId}/codes`, { method: "POST", body: { quantity: count, prefix } }),
      `Đã tạo thêm ${count} mã`,
    );
    if (isDone) setIsAdding(false);
  };

  const onDelete = async () => {
    if (!confirm("Xoá đợt mã này cùng toàn bộ mã của nó? Thao tác không thể hoàn tác.")) return;
    setPending("delete");
    try {
      await adminFetch(`/api/admin/coupons/${campaignId}`, { method: "DELETE" });
      toast.success("Đã xoá đợt mã");
      router.push("/admin/coupons");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xoá");
      setPending(null);
    }
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onToggle} disabled={pending !== null} className={`${BUTTON} ${isActive ? "bg-slate-100 text-slate-700" : "bg-brand-forest text-white"}`}>
          {pending === "toggle" ? "Đang lưu…" : isActive ? "Tạm dừng" : "Cho chạy lại"}
        </button>
        <button type="button" onClick={() => setIsAdding((v) => !v)} aria-expanded={isAdding} className={`${BUTTON} bg-slate-100 text-slate-700`}>
          <Plus size={14} />
          Tạo thêm mã
        </button>
        {remaining > 0 && (
          <a href={`/api/admin/coupons/${campaignId}/export`} className={`${BUTTON} bg-slate-100 text-slate-700`}>
            <Upload size={14} className="rotate-180" />
            Tải mã chưa dùng (CSV)
          </a>
        )}
        {!hasUsedCodes && (
          <button type="button" onClick={onDelete} disabled={pending !== null} className={`${BUTTON} text-rose-600 hover:bg-rose-50`}>
            <Trash2 size={14} />
            {pending === "delete" ? "Đang xoá…" : "Xoá đợt"}
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd();
          }}
          className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="text-xs font-bold text-slate-700">
            Số lượng
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base font-normal sm:text-sm"
            />
          </label>
          <label className="text-xs font-bold text-slate-700">
            Tiền tố (tuỳ chọn)
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              maxLength={20}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base font-normal uppercase sm:text-sm"
            />
          </label>
          <button type="submit" disabled={pending !== null} className={`${BUTTON} self-end bg-brand-forest text-white`}>
            {pending === "add" ? "Đang tạo…" : "Tạo mã"}
          </button>
        </form>
      )}
    </div>
  );
};

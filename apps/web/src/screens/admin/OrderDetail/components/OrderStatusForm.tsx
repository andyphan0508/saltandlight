"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";

const STATUSES = [
  ["pending_payment", "Chờ thanh toán"],
  ["processing", "Đang xử lý"],
  ["on_hold", "Tạm giữ"],
  ["completed", "Hoàn tất"],
  ["cancelled", "Đã hủy"],
  ["refunded", "Đã hoàn tiền"],
] as const;

export const OrderStatusForm = ({ orderId, currentStatus }: { orderId: string; currentStatus: string }) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    try {
      await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: { status: form.get("status"), note: form.get("note") || undefined },
      });
      toast.success("Đã cập nhật trạng thái đơn hàng");
      formElement.reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
      >
        {STATUSES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        name="note"
        placeholder="Ghi chú nội bộ (tùy chọn)"
        className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
      />
      <Button type="submit" disabled={isSaving} size="sm">
        {isSaving ? "Đang lưu…" : "Cập nhật trạng thái"}
      </Button>
    </form>
  );
};

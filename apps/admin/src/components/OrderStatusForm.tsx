"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";

const STATUSES = [
  ["pending_payment", "Chờ thanh toán"],
  ["processing", "Đang xử lý"],
  ["on_hold", "Tạm giữ"],
  ["completed", "Hoàn tất"],
  ["cancelled", "Đã hủy"],
  ["refunded", "Đã hoàn tiền"],
] as const;

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.get("status"),
        note: form.get("note") || undefined,
      }),
    });
    setSaving(false);
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
      <Button type="submit" disabled={saving} size="sm">
        {saving ? "Đang lưu…" : "Cập nhật trạng thái"}
      </Button>
    </form>
  );
}

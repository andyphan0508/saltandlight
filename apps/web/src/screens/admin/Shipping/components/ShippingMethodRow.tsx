"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";

interface Props {
  id: string;
  type: "flat_rate" | "free_shipping";
  fee: number;
  freeThreshold: number | null;
  isActive: boolean;
}

export const ShippingMethodRow = ({ id, type, fee, freeThreshold, isActive }: Props) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await adminFetch(`/api/admin/shipping-methods/${id}`, {
        method: "PATCH",
        body: {
          fee: Number(form.get("fee")),
          freeThreshold: form.get("freeThreshold") ? Number(form.get("freeThreshold")) : null,
          isActive: form.get("isActive") === "on",
        },
      });
      toast.success("Đã lưu phương thức vận chuyển");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu phương thức vận chuyển");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-card">
      <div>
        <div className="text-xs font-bold uppercase text-ink/50">Loại</div>
        <div className="mt-1 text-sm font-medium">
          {type === "flat_rate" ? "Đồng giá" : "Miễn phí vận chuyển"}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-ink/50">Phí (VND)</label>
        <input
          name="fee"
          type="number"
          defaultValue={fee}
          className="mt-1 w-32 rounded-lg border border-ink/15 px-3 py-1.5 text-sm"
        />
      </div>
      {type === "free_shipping" && (
        <div>
          <label className="text-xs font-bold uppercase text-ink/50">Ngưỡng miễn phí (VND)</label>
          <input
            name="freeThreshold"
            type="number"
            defaultValue={freeThreshold ?? ""}
            className="mt-1 w-40 rounded-lg border border-ink/15 px-3 py-1.5 text-sm"
          />
        </div>
      )}
      <label className="flex items-center gap-2 pb-1.5 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={isActive} />
        Đang áp dụng
      </label>
      <Button type="submit" size="sm" disabled={isSaving}>
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </form>
  );
};

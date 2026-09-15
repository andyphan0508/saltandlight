"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Modal } from "@/components/Modal";
import { Truck, X } from "@/components/admin/Icons";
import type { Province, ZoneItem } from "@/interfaces/shipping";
import { ProvincePicker } from "./ProvincePicker";

const inputClass = "w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none";

interface ShippingZoneFormModalProps {
  provinces: Province[];
  onClose: () => void;
  onCreated: (zone: ZoneItem) => void;
}

/** Creates a shipping zone with a flat fee and an optional free-shipping threshold. Mounted once per open. */
export const ShippingZoneFormModal = ({ provinces, onClose, onCreated }: ShippingZoneFormModalProps) => {
  const [name, setName] = useState("");
  const [isNationwide, setIsNationwide] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [fee, setFee] = useState<number | "">(0);
  const [hasFreeShipping, setHasFreeShipping] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên chính sách");
      return;
    }
    if (!isNationwide && selectedCodes.length === 0) {
      setError("Vui lòng chọn ít nhất 1 tỉnh/thành hoặc đánh dấu Toàn quốc");
      return;
    }
    if (fee === "" || Number(fee) < 0) {
      setError("Vui lòng nhập phí vận chuyển hợp lệ");
      return;
    }

    setIsSaving(true);
    setError(null);
    const methods = [
      { type: "flat_rate" as const, fee: Number(fee), freeThreshold: null, isActive: true },
      ...(hasFreeShipping
        ? [
            {
              type: "free_shipping" as const,
              fee: 0,
              freeThreshold: freeThreshold === "" ? null : Number(freeThreshold),
              isActive: true,
            },
          ]
        : []),
    ];

    try {
      const data = await adminFetch<{ zone: ZoneItem }>("/api/admin/shipping-zones", {
        method: "POST",
        body: { name, provinceCodes: isNationwide ? [] : selectedCodes, methods },
      });
      toast.success("Tạo chính sách vận chuyển thành công!");
      onCreated(data.zone);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      labelledBy="shipping-zone-form-title"
      className="bg-white max-w-xl rounded-3xl border border-ink/10 flex flex-col max-h-[92vh] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <h3 id="shipping-zone-form-title" className="font-display font-bold uppercase text-base text-ink flex items-center gap-2">
          <Truck size={18} className="text-brand-forest" />
          Tạo Chính Sách Vận Chuyển
        </h3>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5 text-ink">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">{error}</div>
        )}

        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            Tên chính sách <span className="text-sale">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Nội thành TP.HCM, Vùng xa"
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={isNationwide}
              onChange={(e) => setIsNationwide(e.target.checked)}
              className="h-4 w-4 rounded accent-brand-forest"
            />
            Áp dụng Toàn quốc (mặc định khi khách chưa có chính sách riêng)
          </label>
          {!isNationwide && <ProvincePicker provinces={provinces} selectedCodes={selectedCodes} onChange={setSelectedCodes} />}
        </div>

        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            Phí vận chuyển đồng giá (VND) <span className="text-sale">*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value ? Number(e.target.value) : "")}
            placeholder="30000"
            className={inputClass}
          />
        </div>

        <div className="rounded-2xl bg-mint-50 p-4 border border-mint-200 space-y-3">
          <label className="flex items-center gap-2.5 text-xs font-bold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={hasFreeShipping}
              onChange={(e) => setHasFreeShipping(e.target.checked)}
              className="h-4 w-4 rounded accent-brand-forest"
            />
            Miễn phí vận chuyển khi đơn hàng đạt ngưỡng
          </label>
          {hasFreeShipping && (
            <input
              type="number"
              min="0"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value ? Number(e.target.value) : "")}
              placeholder="VD: 500000"
              className={inputClass}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSaving} className="bg-brand-forest text-white">
            {isSaving ? "Đang lưu..." : "Tạo Chính Sách"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

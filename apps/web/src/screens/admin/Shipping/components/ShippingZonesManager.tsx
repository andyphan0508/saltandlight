"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Plus, Truck } from "@/components/admin/Icons";
import type { Province, ZoneItem } from "@/interfaces/shipping";
import { ShippingZoneFormModal } from "./ShippingZoneFormModal";
import { ZoneCard } from "./ZoneCard";

interface ShippingZonesManagerProps {
  initialZones: ZoneItem[];
  provinces: Province[];
}

/** Shipping zones list with delete; "create" opens ShippingZoneFormModal. */
export const ShippingZonesManager = ({ initialZones, provinces }: ShippingZonesManagerProps) => {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneItem[]>(initialZones);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const provinceNameByCode = new Map(provinces.map((p) => [p.code, p.name]));

  const onDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách vận chuyển này?")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/api/admin/shipping-zones/${id}`, { method: "DELETE" });
      setZones((prev) => prev.filter((z) => z.id !== id));
      toast.success("Đã xóa chính sách vận chuyển!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa chính sách này.");
    } finally {
      setDeletingId(null);
    }
  };

  const onCreated = (zone: ZoneItem) => {
    setZones((prev) => [...prev, zone]);
    setIsFormOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-ink/60">
          Mỗi chính sách áp dụng cho các tỉnh/thành đã chọn; chính sách &quot;Toàn quốc&quot; (không chọn tỉnh nào) chỉ áp dụng khi
          khách hàng ở khu vực chưa có chính sách riêng.
        </p>
        <Button type="button" onClick={() => setIsFormOpen(true)} className="flex shrink-0 items-center gap-2 bg-brand-forest text-white">
          <Plus size={16} />
          <span>Tạo chính sách vận chuyển</span>
        </Button>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            provinceNameByCode={provinceNameByCode}
            isDeleting={deletingId === zone.id}
            onDelete={() => onDelete(zone.id)}
          />
        ))}

        {zones.length === 0 && (
          <div className="luno-card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Truck size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-sm">Chưa có khu vực vận chuyển</h3>
            <p className="mt-1 text-xs text-slate-400">Vui lòng thiết lập cấu hình biểu phí vận chuyển cho hệ thống.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ShippingZoneFormModal provinces={provinces} onClose={() => setIsFormOpen(false)} onCreated={onCreated} />
      )}
    </div>
  );
};

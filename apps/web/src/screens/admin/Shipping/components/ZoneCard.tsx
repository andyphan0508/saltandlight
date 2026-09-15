"use client";

import { Trash2, Truck } from "@/components/admin/Icons";
import type { ZoneItem } from "@/interfaces/shipping";
import { ShippingMethodRow } from "./ShippingMethodRow";

interface ZoneCardProps {
  zone: ZoneItem;
  provinceNameByCode: Map<number, string>;
  isDeleting: boolean;
  onDelete: () => void;
}

/** One shipping zone: its provinces (or nationwide) and an editable row per shipping method. */
export const ZoneCard = ({ zone, provinceNameByCode, isDeleting, onDelete }: ZoneCardProps) => (
  <div className="luno-card p-6 space-y-4">
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2.5 text-sm font-bold uppercase text-slate-800 tracking-wider">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-100 text-brand-forest">
          <Truck size={17} />
        </span>
        <span>{zone.name}</span>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
        title="Xóa chính sách"
      >
        <Trash2 size={15} />
      </button>
    </div>

    <div className="flex flex-wrap gap-1.5">
      {zone.provinceCodes.length === 0 ? (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">Toàn quốc (mặc định)</span>
      ) : (
        zone.provinceCodes.map((code) => (
          <span key={code} className="rounded-full bg-mint-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-forest">
            {provinceNameByCode.get(code) ?? code}
          </span>
        ))
      )}
    </div>

    <div className="space-y-3 pt-1">
      {zone.methods.map((method) => (
        <ShippingMethodRow
          key={method.id}
          id={method.id}
          type={method.type}
          fee={method.fee}
          freeThreshold={method.freeThreshold}
          isActive={method.isActive}
        />
      ))}
    </div>
  </div>
);

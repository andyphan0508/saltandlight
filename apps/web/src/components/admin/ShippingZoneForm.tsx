"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { Plus, Trash2, X, Truck } from "./Icons";
import { ShippingMethodRow } from "./ShippingMethodRow";

interface Province {
  code: number;
  name: string;
}

interface Method {
  id: string;
  type: "flat_rate" | "free_shipping";
  fee: number;
  freeThreshold: number | null;
  isActive: boolean;
}

export interface ZoneItem {
  id: string;
  name: string;
  provinceCodes: number[];
  methods: Method[];
}

export function ShippingZonesManager({
  initialZones,
  provinces,
}: {
  initialZones: ZoneItem[];
  provinces: Province[];
}) {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneItem[]>(initialZones);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [nationwide, setNationwide] = useState(false);
  const [fee, setFee] = useState<number | "">(0);
  const [hasFreeShipping, setHasFreeShipping] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const provinceNameByCode = new Map(provinces.map((p) => [p.code, p.name]));

  function openCreateModal() {
    setName("");
    setSelectedCodes([]);
    setNationwide(false);
    setFee(0);
    setHasFreeShipping(false);
    setFreeThreshold("");
    setSearchQuery("");
    setError(null);
    setIsModalOpen(true);
  }

  function toggleProvince(code: number) {
    setSelectedCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách vận chuyển này?")) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/shipping-zones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setZones((prev) => prev.filter((z) => z.id !== id));
      toast.success("Đã xóa chính sách vận chuyển!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa chính sách này.");
    } finally {
      setIsDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên chính sách");
      return;
    }
    if (!nationwide && selectedCodes.length === 0) {
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
      const res = await fetch("/api/admin/shipping-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          provinceCodes: nationwide ? [] : selectedCodes,
          methods,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ? JSON.stringify(data.error) : "Có lỗi xảy ra");

      toast.success("Tạo chính sách vận chuyển thành công!");
      setIsModalOpen(false);
      setZones((prev) => [...prev, data.zone]);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-ink/60">
          Mỗi chính sách áp dụng cho các tỉnh/thành đã chọn; chính sách &quot;Toàn quốc&quot; (không chọn tỉnh nào) chỉ áp dụng khi khách hàng ở khu vực chưa có chính sách riêng.
        </p>
        <Button
          type="button"
          onClick={openCreateModal}
          className="flex shrink-0 items-center gap-2 bg-brand-forest text-white"
        >
          <Plus size={16} />
          <span>Tạo chính sách vận chuyển</span>
        </Button>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => (
          <div key={zone.id} className="luno-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-sm font-bold uppercase text-slate-800 tracking-wider">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint-100 text-brand-forest">
                  <Truck size={17} />
                </span>
                <span>{zone.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(zone.id)}
                disabled={isDeletingId === zone.id}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                title="Xóa chính sách"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {zone.provinceCodes.length === 0 ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  Toàn quốc (mặc định)
                </span>
              ) : (
                zone.provinceCodes.map((code) => (
                  <span
                    key={code}
                    className="rounded-full bg-mint-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-forest"
                  >
                    {provinceNameByCode.get(code) ?? code}
                  </span>
                ))
              )}
            </div>

            <div className="space-y-3 pt-1">
              {zone.methods.map((m) => (
                <ShippingMethodRow
                  key={m.id}
                  id={m.id}
                  type={m.type}
                  fee={m.fee}
                  freeThreshold={m.freeThreshold}
                  isActive={m.isActive}
                />
              ))}
            </div>
          </div>
        ))}

        {zones.length === 0 && (
          <div className="luno-card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Truck size={28} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 text-sm">Chưa có khu vực vận chuyển</h3>
            <p className="mt-1 text-xs text-slate-400">
              Vui lòng thiết lập cấu hình biểu phí vận chuyển cho hệ thống.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-ink/10 flex flex-col max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
              <h3 className="font-display font-bold uppercase text-base text-ink flex items-center gap-2">
                <Truck size={18} className="text-brand-forest" />
                Tạo Chính Sách Vận Chuyển
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-ink/50 hover:bg-ink/5 text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  {error}
                </div>
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
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={nationwide}
                    onChange={(e) => setNationwide(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-forest"
                  />
                  Áp dụng Toàn quốc (mặc định khi khách chưa có chính sách riêng)
                </label>

                {!nationwide && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-ink">
                        Chọn tỉnh/thành ({selectedCodes.length} đã chọn)
                      </label>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tỉnh/thành..."
                      className="w-full rounded-xl border border-ink/15 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
                    />
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 p-2 space-y-1 bg-slate-50">
                      {filteredProvinces.map((p) => {
                        const isSelected = selectedCodes.includes(p.code);
                        return (
                          <label
                            key={p.code}
                            className={`flex items-center gap-2.5 rounded-lg p-2 text-xs cursor-pointer transition-colors ${
                              isSelected ? "bg-mint-100 text-brand-forest font-bold" : "hover:bg-white text-ink"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProvince(p.code)}
                              className="h-4 w-4 rounded accent-brand-forest"
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
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
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm focus:border-brand-forest focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="bg-brand-forest text-white"
                >
                  {isSaving ? "Đang lưu..." : "Tạo Chính Sách"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

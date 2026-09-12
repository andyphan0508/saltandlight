"use client";

import { useEffect, useState } from "react";

interface VnWard {
  code: number;
  name: string;
}

interface VnProvince {
  code: number;
  name: string;
  wards: VnWard[];
}

export interface LocationValue {
  provinceCode: number | null;
  province: string;
  wardCode: number | null;
  ward: string;
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}

/**
 * Cascading Province → Ward selects backed by the vendored /api/locations
 * dataset (post-2025 reform: 34 provinces, no district tier).
 */
export const LocationSelect = ({
  value,
  onChange,
}: LocationSelectProps) => {
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => setProvinces(data.provinces ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedProvince = provinces.find((p) => p.code === value.provinceCode);
  const wards = selectedProvince?.wards ?? [];

  const onProvinceChange = (code: string) => {
    const province = provinces.find((p) => p.code === Number(code));
    onChange({
      provinceCode: province?.code ?? null,
      province: province?.name ?? "",
      wardCode: null,
      ward: "",
    });
  };

  const onWardChange = (code: string) => {
    const ward = wards.find((w) => w.code === Number(code));
    onChange({
      ...value,
      wardCode: ward?.code ?? null,
      ward: ward?.name ?? "",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink/70">
          Tỉnh / Thành phố <span className="text-sale">*</span>
        </label>
        <select
          required
          disabled={isLoading}
          value={value.provinceCode ?? ""}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors bg-white disabled:opacity-50"
        >
          <option value="" disabled>
            {isLoading ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
          </option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink/70">
          Phường / Xã <span className="text-sale">*</span>
        </label>
        <select
          required
          disabled={!selectedProvince}
          value={value.wardCode ?? ""}
          onChange={(e) => onWardChange(e.target.value)}
          className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors bg-white disabled:opacity-50"
        >
          <option value="" disabled>
            {selectedProvince ? "Chọn Phường/Xã" : "Chọn Tỉnh/Thành trước"}
          </option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

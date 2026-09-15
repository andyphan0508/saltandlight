"use client";

import { useState } from "react";
import type { Province } from "@/interfaces/shipping";

interface ProvincePickerProps {
  provinces: Province[];
  selectedCodes: number[];
  onChange: (codes: number[]) => void;
}

/** Searchable checkbox list of provinces. */
export const ProvincePicker = ({ provinces, selectedCodes, onChange }: ProvincePickerProps) => {
  const [query, setQuery] = useState("");
  const visibleProvinces = provinces.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const onToggle = (code: number) =>
    onChange(selectedCodes.includes(code) ? selectedCodes.filter((c) => c !== code) : [...selectedCodes, code]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-ink">Chọn tỉnh/thành ({selectedCodes.length} đã chọn)</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm tỉnh/thành..."
        className="w-full rounded-xl border border-ink/15 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
      />
      <div className="max-h-48 overflow-y-auto rounded-xl border border-ink/10 p-2 space-y-1 bg-slate-50">
        {visibleProvinces.map((province) => {
          const isSelected = selectedCodes.includes(province.code);
          return (
            <label
              key={province.code}
              className={`flex items-center gap-2.5 rounded-lg p-2 text-xs cursor-pointer transition-colors ${
                isSelected ? "bg-mint-100 text-brand-forest font-bold" : "hover:bg-white text-ink"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(province.code)}
                className="h-4 w-4 rounded accent-brand-forest"
              />
              <span>{province.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

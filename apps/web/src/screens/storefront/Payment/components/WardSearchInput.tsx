"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin } from "@/components/Icons";
import { buildWardIndex, searchWards, type WardOption } from "@/helpers/ward-search";

export interface LocationValue {
  provinceCode: number | null;
  province: string;
  wardCode: number | null;
  ward: string;
}

interface WardSearchInputProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}

const EMPTY: LocationValue = { provinceCode: null, province: "", wardCode: null, ward: "" };
const label = (v: { ward: string; province: string }) => `${v.ward}, ${v.province}`;

/**
 * One box for Phường/Xã + Tỉnh/Thành: type any part of the ward (or province)
 * name, with or without diacritics, and pick from the matches. Picking fills
 * both codes the order API validates; editing the text again clears the pick,
 * and native form validation blocks submitting until a suggestion is chosen.
 */
export const WardSearchInput = ({ value, onChange }: WardSearchInputProps) => {
  const [index, setIndex] = useState<WardOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState(value.wardCode ? label(value) : "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => setIndex(buildWardIndex(data.provinces ?? [])))
      .catch(() => setIndex([]))
      .finally(() => setIsLoading(false));
  }, []);

  const { results, total } = useMemo(() => searchWards(index, text), [index, text]);

  // Block submit until a suggestion is picked; the message is what the browser shows
  useEffect(() => {
    inputRef.current?.setCustomValidity(value.wardCode ? "" : "Vui lòng chọn Phường/Xã trong danh sách gợi ý");
  }, [value.wardCode]);

  const pick = (option: WardOption) => {
    onChange({ provinceCode: option.provinceCode, province: option.province, wardCode: option.wardCode, ward: option.ward });
    setText(label(option));
    setIsOpen(false);
  };

  const onType = (next: string) => {
    setText(next);
    setActiveIndex(0);
    setIsOpen(true);
    if (value.wardCode) onChange(EMPTY);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && isOpen && results[activeIndex]) {
      e.preventDefault();
      pick(results[activeIndex]!);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isListShown = isOpen && text.trim().length > 0 && !value.wardCode;

  return (
    <div className="relative">
      <label htmlFor={`${listboxId}-input`} className="text-xs font-bold uppercase tracking-wide text-ink/70">
        Phường / Xã, Tỉnh / Thành phố <span className="text-sale">*</span>
      </label>
      <div className="relative mt-1.5">
        <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          ref={inputRef}
          id={`${listboxId}-input`}
          type="text"
          required
          autoComplete="off"
          role="combobox"
          aria-expanded={isListShown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={isListShown && results[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          value={text}
          disabled={isLoading}
          onChange={(e) => onType(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? "Đang tải danh sách địa chỉ…" : "Gõ tên phường/xã, VD: Bến Thành, Bà Điểm…"}
          className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none disabled:opacity-50 ${
            value.wardCode ? "border-brand-forest bg-mint-50/40 font-semibold text-ink" : "border-ink/15 bg-white focus:border-ink"
          }`}
        />
      </div>

      {value.wardCode ? (
        <p className="mt-1 text-[11px] font-semibold text-brand-forest">✓ Đã chọn — sửa chữ trong ô để chọn lại</p>
      ) : (
        <p className="mt-1 text-[11px] text-ink/45">Gõ có dấu hoặc không dấu; thêm tên tỉnh để thu hẹp, VD: “ben thanh ho chi minh”.</p>
      )}

      {isListShown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-2xl border border-ink/10 bg-white p-1.5 shadow-xl"
        >
          {results.map((option, i) => (
            <li
              key={option.wardCode}
              id={`${listboxId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              // mousedown, not click: fires before the input's blur closes the list
              onMouseDown={(e) => {
                e.preventDefault();
                pick(option);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer rounded-xl px-3 py-2 ${i === activeIndex ? "bg-mint-50" : ""}`}
            >
              <span className="block text-sm font-semibold text-ink">{option.ward}</span>
              <span className="block text-[11px] text-ink/50">{option.province}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-3 text-xs text-ink/50">Không tìm thấy “{text}”. Thử gõ ngắn hơn hoặc thêm tên tỉnh.</li>
          )}
          {total > results.length && (
            <li className="px-3 py-2 text-[11px] text-ink/40">
              Còn {total - results.length} kết quả khác — gõ thêm để thu hẹp.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

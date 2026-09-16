"use client";

import { useState } from "react";
import { COLOR_PRESETS, isHexColor, textColorOn } from "@/helpers/color";
import type { ColorChoice } from "@/interfaces/product-form";
import { Plus, X } from "../Icons";
import { inputClass } from "./classes";

interface ColorPaletteFieldProps {
  colors: ColorChoice[];
  onAdd: (color: ColorChoice) => void;
  onRemove: (name: string) => void;
}

const DEFAULT_DRAFT = "#A8E6CF";

/** Builds the product's color list: pick from the palette or mix a custom hex, then name it. */
export const ColorPaletteField = ({ colors, onAdd, onRemove }: ColorPaletteFieldProps) => {
  const [hex, setHex] = useState(DEFAULT_DRAFT);
  const [name, setName] = useState("");

  const onAddCustom = () => {
    const trimmed = name.trim();
    if (!trimmed || !isHexColor(hex)) return;
    onAdd({ name: trimmed, hex: hex.toUpperCase() });
    setName("");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Màu sắc</span>
      <p className="mt-1 text-xs text-ink/45">
        Chọn màu có sẵn hoặc tự pha màu rồi đặt tên. Mã màu này chính là nền của nút chọn màu ngoài storefront.
      </p>

      {/* Preset palette — one click adds the color with its name */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.hex}
            type="button"
            onClick={() => onAdd(preset)}
            title={`${preset.name} · ${preset.hex}`}
            className="h-7 w-7 rounded-full border border-slate-300 shadow-xs transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: preset.hex }}
          >
            <span className="sr-only">Thêm màu {preset.name}</span>
          </button>
        ))}
      </div>

      {/* Custom color: native picker + a name */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Chọn mã màu"
          className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        <span className="font-mono text-[11px] uppercase text-slate-500">{hex}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCustom();
            }
          }}
          placeholder="Tên màu, VD: Xanh rêu"
          className={`${inputClass} max-w-[200px]`}
        />
        <button
          type="button"
          onClick={onAddCustom}
          disabled={!name.trim()}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink hover:border-brand-forest hover:text-brand-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} /> Thêm màu
        </button>
      </div>

      {/* The list that variants get generated from — rendered exactly like the storefront pills */}
      {colors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/70 pt-3">
          {colors.map((color) => (
            <span
              key={color.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-bold shadow-xs"
              style={{ backgroundColor: color.hex, color: textColorOn(color.hex) }}
            >
              {color.name}
              <button
                type="button"
                onClick={() => onRemove(color.name)}
                aria-label={`Xóa màu ${color.name}`}
                className="opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

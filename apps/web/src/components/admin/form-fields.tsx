"use client";

import type { ComponentType, ReactNode } from "react";
import { BLOCK_ICON_KEYS } from "@/interfaces/page-block";
import {
  Check,
  CrossIcon,
  Gift,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Truck,
} from "./Icons";

/** Shared small form primitives for admin editing UIs (page blocks, product form, site settings, ...). */

export const TextField = ({
  label,
  value,
  onChange,
  isMultiline,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isMultiline?: boolean;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </label>
    {isMultiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
      />
    )}
  </div>
);

/** Editable list of objects: add, remove, and patch each item through `renderItem`. */
export const ArrayEditor = <T extends Record<string, any>>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, onUpdate: (patch: Partial<T>) => void, index: number) => ReactNode;
}) => {
  const onUpdate = (index: number, patch: Partial<T>) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const onRemove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const onAdd = () => onChange([...items, newItem()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline">
          <Plus size={12} /> Thêm mục
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-slate-200 p-3 bg-slate-50/50">
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Xoá mục"
              className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
            {renderItem(item, (patch) => onUpdate(i, patch), i)}
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-slate-400 italic">Chưa có mục nào.</p>}
      </div>
    </div>
  );
};

/** Editable list of plain strings (paragraphs, bullet points). */
export const StringListEditor = ({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) => {
  const onUpdate = (index: number, value: string) => onChange(values.map((x, i) => (i === index ? value : x)));
  const onRemove = (index: number) => onChange(values.filter((_, i) => i !== index));
  const onAdd = () => onChange([...values, ""]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline">
          <Plus size={12} /> Thêm dòng
        </button>
      </div>
      <div className="space-y-2">
        {values.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Xoá dòng"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ICON_PREVIEW: Record<string, ComponentType<{ size?: number | string; className?: string }>> = {
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Sparkles,
  CrossIcon,
  Star,
  Gift,
  Phone,
  Mail,
  MapPin,
  Check,
};

/** Select for a page-block icon key, with a preview of the chosen icon. */
export const IconSelect = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const SelectedIcon = value ? ICON_PREVIEW[value] : null;
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {SelectedIcon && (
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-mint-50 text-brand-forest border border-brand-forest/30 shrink-0">
            <SelectedIcon size={18} />
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none bg-white"
        >
          <option value="">— Không chọn —</option>
          {BLOCK_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

/** White card with an uppercase heading, used by the product form and order detail page. */
export const Section = ({
  title,
  icon,
  badge,
  action,
  children,
}: {
  title: string;
  icon?: ReactNode;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-brand-forest">{icon}</span>}
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink/70">{title}</h2>
        {badge && (
          <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest">{badge}</span>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const Field = ({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className}>
    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
      {label} {required && <span className="text-sale">*</span>}
    </label>
    {children}
  </div>
);

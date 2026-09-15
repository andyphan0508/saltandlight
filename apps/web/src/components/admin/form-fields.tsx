"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "./Icons";

/** Shared small form primitives for admin editing UIs (page-blocks, site settings, ...). */

export function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {multiline ? (
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
}

export function ArrayEditor<T extends Record<string, any>>({
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
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, newItem()]);
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline">
          <Plus size={12} /> Thêm mục
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-slate-200 p-3 bg-slate-50/50">
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
            {renderItem(item, (patch) => update(i, patch), i)}
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-slate-400 italic">Chưa có mục nào.</p>}
      </div>
    </div>
  );
}

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

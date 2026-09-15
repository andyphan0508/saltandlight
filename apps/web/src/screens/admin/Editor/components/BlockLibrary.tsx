"use client";

import { ChevronLeft } from "@/components/admin/Icons";
import type { PageBlockTypeValue } from "@/interfaces/page-block";
import { BLOCK_TEMPLATES } from "./block-templates";

interface BlockLibraryProps {
  onAdd: (type: PageBlockTypeValue) => void;
  onBack: () => void;
}

/** Block template library; picking a template adds that block to the current page. */
export const BlockLibrary = ({ onAdd, onBack }: BlockLibraryProps) => (
  <div className="p-4 space-y-3">
    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Thư viện khối mẫu</h4>
        <p className="text-[11px] text-slate-400">Chọn khối bạn muốn thêm vào trang web</p>
      </div>
      <button
        type="button"
        onClick={onBack}
        aria-label="Quay lại danh sách khối"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <ChevronLeft size={16} />
      </button>
    </div>

    <div className="grid grid-cols-1 gap-2.5">
      {BLOCK_TEMPLATES.map(({ type, title, badge, description, icon: Icon, iconBg, iconColor }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          className="group relative flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-brand-forest hover:shadow-xs hover:bg-mint-50/40 transition-all text-left"
        >
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconBg} ${iconColor}`}
          >
            <Icon size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-bold text-slate-900 group-hover:text-brand-forest transition-colors truncate">{title}</span>
              {badge && (
                <span className="rounded-md bg-mint-100 px-1.5 py-0.2 text-[9px] font-bold text-brand-forest shrink-0">{badge}</span>
              )}
            </span>
            <span className="block text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{description}</span>
          </span>
        </button>
      ))}
    </div>
  </div>
);

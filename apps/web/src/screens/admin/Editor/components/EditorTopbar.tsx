"use client";

import { Check, ExternalLink, Monitor, RotateCw, Smartphone, Sparkles } from "@/components/admin/Icons";
import { MANAGED_PAGES } from "@/helpers/managed-pages";
import type { PreviewDevice } from "@/interfaces/page-block";

const DEVICES = [
  { id: "desktop", label: "Desktop", title: "Xem trước màn hình Máy tính (100%)", icon: Monitor, iconClassName: undefined },
  { id: "tablet", label: "Tablet", title: "Xem trước máy tính bảng Tablet (768px)", icon: Smartphone, iconClassName: "rotate-90" },
  { id: "mobile", label: "Mobile", title: "Xem trước điện thoại Mobile (390px)", icon: Smartphone, iconClassName: undefined },
] as const;

interface EditorTopbarProps {
  currentPage: string;
  pagePath: string;
  device: PreviewDevice;
  onSwitchPage: (page: string) => void;
  onDeviceChange: (device: PreviewDevice) => void;
  onReloadPreview: () => void;
}

/** Editor header: page picker, preview device switcher, reload and open-storefront actions. */
export const EditorTopbar = ({ currentPage, pagePath, device, onSwitchPage, onDeviceChange, onReloadPreview }: EditorTopbarProps) => (
  <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest text-white shadow-xs">
          <Sparkles size={15} />
        </span>
        <span className="text-xs sm:text-sm font-bold tracking-tight text-white hidden sm:inline">Elementor Visual Editor</span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
        <span className="text-[11px] text-slate-400 font-medium">Trang:</span>
        <select
          value={currentPage}
          onChange={(e) => onSwitchPage(e.target.value)}
          className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
        >
          {MANAGED_PAGES.map((page) => (
            <option key={page.slug} value={page.slug} className="bg-slate-900 text-white">
              {page.label} ({page.path})
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
      {DEVICES.map(({ id, label, title, icon: Icon, iconClassName }) => (
        <button
          key={id}
          type="button"
          onClick={() => onDeviceChange(id)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            device === id ? "bg-brand-forest text-white shadow-xs" : "text-slate-400 hover:text-white"
          }`}
          title={title}
        >
          <Icon size={14} className={iconClassName} />
          <span className="hidden md:inline">{label}</span>
        </button>
      ))}
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onReloadPreview}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Tải lại Canvas xem trước"
      >
        <RotateCw size={15} />
      </button>
      <a
        href={pagePath}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Mở storefront thật trong tab mới"
      >
        <ExternalLink size={15} />
      </a>
      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
        <Check size={12} /> Live Ready
      </span>
    </div>
  </header>
);

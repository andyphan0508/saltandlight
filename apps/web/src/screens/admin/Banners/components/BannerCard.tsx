"use client";

import Image from "next/image";
import { Pencil, Sparkles, Trash2 } from "@/components/admin/Icons";
import type { BannerItem } from "@/interfaces/banner";

interface BannerCardProps {
  banner: BannerItem;
  isDeleting: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Slide thumbnail with its status toggle, link, edit and delete actions. */
export const BannerCard = ({ banner, isDeleting, onToggleActive, onEdit, onDelete }: BannerCardProps) => (
  <div
    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 bg-white ${
      banner.isActive
        ? "border-slate-200 shadow-xs hover:border-brand-forest/40 hover:shadow-md"
        : "border-slate-200/60 opacity-60 bg-slate-50/50"
    }`}
  >
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
      {banner.imageUrl ? (
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs font-medium">Chưa có ảnh</div>
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          banner.bgGradient || "from-slate-950/90 via-slate-950/40 to-transparent"
        } opacity-80`}
      />

      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
          <Sparkles size={11} className="text-amber-300" />
          {banner.badge || "Slide"}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-slate-200 border border-white/10">
          Vị trí #{banner.sortOrder}
        </span>
      </div>

      <div className="absolute top-3 right-3">
        <button
          type="button"
          onClick={onToggleActive}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md transition-all ${
            banner.isActive ? "bg-emerald-500/90 hover:bg-emerald-600 text-white" : "bg-slate-700/90 hover:bg-slate-800 text-slate-300"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? "bg-white animate-pulse" : "bg-slate-400"}`} />
          {banner.isActive ? "Đang phát" : "Tắt"}
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-base font-bold text-white leading-tight drop-shadow-sm line-clamp-1">{banner.title}</h3>
        {banner.subtitle && (
          <p className="text-xs text-white/80 line-clamp-1 mt-0.5 drop-shadow-sm font-medium">{banner.subtitle}</p>
        )}
      </div>
    </div>

    <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
      <div className="min-w-0 pr-2">
        <div className="text-[11px] text-slate-400 truncate">
          Liên kết: <span className="font-mono text-slate-700">{banner.linkUrl || "/san-pham"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-xl text-slate-600 hover:text-brand-forest hover:bg-mint-50 transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
          title="Xóa banner"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  </div>
);

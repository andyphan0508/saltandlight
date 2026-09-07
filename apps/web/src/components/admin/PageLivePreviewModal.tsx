"use client";

import { useState } from "react";
import { X, Globe, ExternalLink, RotateCw, Monitor, Smartphone } from "./Icons";

export function PageLivePreviewModal({
  isOpen,
  page,
  onClose,
}: {
  isOpen: boolean;
  page: string;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const urlPath = page === "home" ? "/" : `/${page}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-6xl h-[92vh] rounded-3xl bg-slate-900 shadow-2xl border border-slate-700 overflow-hidden flex flex-col animate-pop-in">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-brand-forest" />
            <span className="text-xs sm:text-sm font-bold">
              Xem trước trang web (Live Preview):{" "}
              <code className="text-emerald-400 font-mono">{urlPath}</code>
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                device === "desktop"
                  ? "bg-brand-forest text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor size={14} />
              <span>Máy tính (Desktop)</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                device === "mobile"
                  ? "bg-brand-forest text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone size={14} />
              <span>Điện thoại (Mobile)</span>
            </button>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setKey((k) => k + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Tải lại trang xem trước"
            >
              <RotateCw size={16} />
            </button>
            <a
              href={urlPath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Mở trong tab mới"
            >
              <ExternalLink size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đóng xem trước"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 overflow-auto bg-slate-950/80 flex items-center justify-center p-2 sm:p-4">
          <div
            className={`transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
              device === "mobile"
                ? "w-[390px] border-4 border-slate-700 shadow-brand-forest/20"
                : "w-full border border-slate-800"
            }`}
          >
            <iframe
              key={key}
              src={urlPath}
              title="Live Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

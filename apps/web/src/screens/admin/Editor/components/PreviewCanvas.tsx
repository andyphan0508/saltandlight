"use client";

import type { RefObject } from "react";
import type { PreviewDevice } from "@/interfaces/page-block";

const FRAME_CLASS: Record<PreviewDevice, string> = {
  desktop: "w-full border border-slate-800",
  tablet: "w-[768px] border-4 border-slate-700 shadow-brand-forest/20",
  mobile: "w-[390px] border-4 border-slate-700 shadow-brand-forest/20",
};

interface PreviewCanvasProps {
  device: PreviewDevice;
  src: string;
  frameKey: string;
  iframeRef: RefObject<HTMLIFrameElement>;
}

/** Storefront page rendered in an iframe at desktop, tablet or phone width. */
export const PreviewCanvas = ({ device, src, frameKey, iframeRef }: PreviewCanvasProps) => (
  <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-5 overflow-auto relative">
    <div
      className={`transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col relative ${FRAME_CLASS[device]}`}
    >
      {device !== "desktop" && (
        <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0">
          <span className="w-16 h-1 rounded-full bg-slate-700" />
        </div>
      )}
      <iframe key={frameKey} ref={iframeRef} src={src} title="Elementor Live Canvas" className="w-full flex-1 border-0 bg-white" />
    </div>
  </div>
);

"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles } from "./Icons";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string }[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-white border border-ink/5 shadow-card group">
        {current ? (
          <Image
            src={current.url}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-mint-50 text-ink/30 p-8 text-center">
            <Sparkles size={32} className="text-mint-300 mb-2" />
            <span className="font-display font-black uppercase tracking-wider text-sm">Salt &amp; Light</span>
            <span className="text-xs mt-1">Faith &amp; Apparel</span>
          </div>
        )}

        {/* Salt & Light Watermark Tag */}
        <div className="absolute left-4 bottom-4 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white select-none">
          100% Ảnh Thực Tế
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => {
            const isActive = i === active;
            return (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-ink shadow-md scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

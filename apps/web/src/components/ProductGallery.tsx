"use client";

import Image from "next/image";
import { useState } from "react";

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
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-mint-100">
        {current ? (
          <Image src={current.url} alt={productName} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">Salt & Light</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 ${
                i === active ? "border-ink" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

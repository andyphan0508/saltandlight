import { formatVND } from "@saltandlight/domain";
import { Truck } from "@/components/Icons";

export const FREESHIP_THRESHOLD = 299000;

export interface FreeshipBannerProps {
  subtotal: number;
}

export const FreeshipBanner = ({ subtotal }: FreeshipBannerProps) => {
  const neededForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgress = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));

  return (
    <div className="rounded-3xl bg-mint-100 p-6 border border-mint-200 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Truck size={20} className="text-brand-forest flex-shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-ink">
          {neededForFreeship === 0 ? (
            <span className="text-emerald-700">🎉 Chúc mừng! Bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!</span>
          ) : (
            <span>
              Mua thêm <strong>{formatVND(neededForFreeship)}</strong> để được <strong>FREESHIP toàn quốc</strong>!
            </span>
          )}
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full rounded-full bg-mint-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-forest transition-all duration-500"
          style={{ width: `${freeshipProgress}%` }}
        />
      </div>
    </div>
  );
};

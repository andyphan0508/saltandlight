import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ArrowRight, ShoppingBag } from "@/components/Icons";

export const EmptyOrders = () => (
  <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-ink/5 space-y-4 animate-fade-in">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
      <ShoppingBag size={36} />
    </div>
    <h3 className="font-display text-lg font-bold uppercase text-ink">Bạn chưa có đơn hàng nào</h3>
    <p className="text-xs sm:text-sm text-ink/60 max-w-md mx-auto">
      Khám phá các mẫu áo thun Lời Chúa và quà tặng Cơ Đốc ý nghĩa tại Salt &amp; Light. Đơn hàng của bạn sẽ được lưu tự động tại
      đây.
    </p>
    <div className="pt-2">
      <Link href="/san-pham">
        <Button variant="primary" size="lg" className="shadow-md">
          <span>Khám phá bộ sưu tập ngay</span>
          <ArrowRight size={18} />
        </Button>
      </Link>
    </div>
  </div>
);

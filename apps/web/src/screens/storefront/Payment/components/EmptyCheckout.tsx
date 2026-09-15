import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { ShoppingBag } from "@/components/Icons";

export const EmptyCheckout = () => (
  <div className="mx-auto max-w-lg px-4 py-24 text-center animate-fade-in">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-brand-forest">
      <ShoppingBag size={36} />
    </div>
    <h1 className="mt-6 font-display text-2xl font-bold uppercase text-ink">Giỏ hàng đang trống</h1>
    <p className="mt-2 text-sm text-ink/60">Vui lòng chọn sản phẩm vào giỏ hàng trước khi thanh toán.</p>
    <div className="mt-8">
      <Link href="/san-pham">
        <Button variant="primary" size="lg">
          Khám phá sản phẩm
        </Button>
      </Link>
    </div>
  </div>
);

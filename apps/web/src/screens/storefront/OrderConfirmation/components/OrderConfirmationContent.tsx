import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { Check, Phone, Truck } from "@/components/Icons";
import { HotlineLink } from "@/components/ContactInfoProvider";

/** Same page for every payment method: the order number and when it will arrive. */
export const OrderConfirmationContent = ({ orderNumber }: { orderNumber: string }) => (
  <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 space-y-10 text-center">
    {/* Success Badge & Title */}
    <div className="space-y-3">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-md">
        <Check size={38} />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase text-ink">
        Đặt Hàng Thành Công!
      </h1>
      <p className="text-sm text-ink/70">
        Cảm ơn bạn đã lựa chọn Salt &amp; Light. Mã đơn hàng của bạn là:
      </p>
      <div className="inline-block rounded-full bg-ink px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-sm">
        #{orderNumber}
      </div>
    </div>

    <div className="rounded-3xl bg-mint-50 p-8 sm:p-12 border border-mint-200 space-y-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-forest shadow-sm">
        <Truck size={26} />
      </div>
      <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed max-w-xl mx-auto">
        Đơn hàng sẽ được giao đến bạn trong 2-4 ngày tuỳ khu vực. Vui lòng đợi đơn vị vận chuyển liên hệ để giao hàng. Salt
        &amp; Light xin cảm ơn!
      </p>
    </div>

    {/* Bottom CTA */}
    <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
      <Link href="/san-pham">
        <Button variant="outline" size="md">
          Tiếp tục mua sắm
        </Button>
      </Link>
      <Link href={`/tra-cuu-don-hang?order=${encodeURIComponent(orderNumber)}`}>
        <Button variant="primary" size="md" className="shadow-md">
          Tra cứu trạng thái đơn hàng
        </Button>
      </Link>
    </div>

    <div className="pt-4 text-xs text-ink/50 flex items-center justify-center gap-2">
      <Phone size={14} />
      <span>Cần hỗ trợ gấp? Gọi ngay hotline <HotlineLink className="font-bold text-ink hover:underline" /></span>
    </div>
  </div>
);

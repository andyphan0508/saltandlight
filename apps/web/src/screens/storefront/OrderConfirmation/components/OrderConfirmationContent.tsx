import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { Button } from "@saltandlight/ui";
import { Check, Phone, Truck } from "@/components/Icons";
import { HotlineLink } from "@/components/ContactInfoProvider";

export interface TransferInfo {
  qrImageUrl: string | null;
  transferNote: string | null;
  total: number;
}

/**
 * Same page for every payment method: the order number and when it will arrive. Bank-transfer
 * orders also get the QR and transfer details the shop set in admin › Cài đặt thanh toán.
 */
export const OrderConfirmationContent = ({ orderNumber, transfer }: { orderNumber: string; transfer: TransferInfo | null }) => (
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

    {transfer && (
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 text-left">
        <h2 className="font-display text-lg font-bold uppercase text-ink text-center sm:text-left">Thông tin chuyển khoản</h2>
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {transfer.qrImageUrl && (
            <div className="relative h-56 w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white p-2">
              <Image src={transfer.qrImageUrl} alt="Mã QR chuyển khoản" fill sizes="224px" className="object-contain p-2" />
            </div>
          )}
          <div className="w-full space-y-3 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl bg-cream p-4">
              <dt className="text-ink/60">Mã đơn hàng</dt>
              <dd className="font-bold text-ink">{orderNumber}</dd>
              {transfer.total > 0 && (
                <>
                  <dt className="text-ink/60">Số tiền</dt>
                  <dd className="font-bold text-brand-forest">{formatVND(transfer.total)}</dd>
                </>
              )}
            </dl>
            {transfer.transferNote && <p className="whitespace-pre-line leading-relaxed text-ink/80">{transfer.transferNote}</p>}
          </div>
        </div>
      </div>
    )}

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

import Image from "next/image";
import Link from "next/link";
import { formatVND, type PaymentMethodValue } from "@saltandlight/domain";
import { Button } from "@saltandlight/ui";
import { Check, Clock, Phone, Truck } from "@/components/Icons";
import { HotlineLink } from "@/components/ContactInfoProvider";

export interface TransferInfo {
  qrImageUrl: string | null;
  transferNote: string | null;
}

interface OrderConfirmationContentProps {
  orderNumber: string;
  /** Null when the link came without a known method: only the shared parts are shown. */
  method: PaymentMethodValue | null;
  total: number;
  /** What admin › Cài đặt thanh toán holds; only read for bank-transfer orders. */
  transfer: TransferInfo | null;
}

/** QR + transfer details from admin, then what happens once the money arrives. */
const BankTransferSteps = ({ orderNumber, total, transfer }: { orderNumber: string; total: number; transfer: TransferInfo | null }) => (
  <>
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 text-left">
      <h2 className="font-display text-lg font-bold uppercase text-ink text-center sm:text-left">Thông tin chuyển khoản</h2>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {transfer?.qrImageUrl && (
          <div className="relative h-56 w-56 flex-shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white p-2">
            <Image src={transfer.qrImageUrl} alt="Mã QR chuyển khoản" fill sizes="224px" className="object-contain p-2" />
          </div>
        )}
        <div className="w-full space-y-3 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl bg-cream p-4">
            <dt className="text-ink/60">Mã đơn hàng</dt>
            <dd className="font-bold text-ink">{orderNumber}</dd>
            {total > 0 && (
              <>
                <dt className="text-ink/60">Số tiền</dt>
                <dd className="font-bold text-brand-forest">{formatVND(total)}</dd>
              </>
            )}
          </dl>
          {transfer?.transferNote ? (
            <p className="whitespace-pre-line leading-relaxed text-ink/80">{transfer.transferNote}</p>
          ) : (
            !transfer?.qrImageUrl && (
              <p className="leading-relaxed text-ink/80">Shop sẽ liên hệ qua số điện thoại bạn đã để lại để gửi thông tin chuyển khoản.</p>
            )
          )}
        </div>
      </div>
    </div>

    <div className="rounded-3xl bg-mint-50 p-8 sm:p-12 border border-mint-200 space-y-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-forest shadow-sm">
        <Clock size={26} />
      </div>
      <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed max-w-xl mx-auto">
        Sau khi nhận được chuyển khoản, shop sẽ xác nhận và giao hàng đến bạn trong 2-4 ngày tuỳ khu vực. Salt &amp; Light xin
        cảm ơn!
      </p>
    </div>
  </>
);

/** Nothing to pay now: the amount to have ready and the call before delivery. */
const CodSteps = ({ total }: { total: number }) => (
  <div className="rounded-3xl bg-mint-50 p-8 sm:p-12 border border-mint-200 space-y-3">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-forest shadow-sm">
      <Truck size={26} />
    </div>
    {total > 0 && (
      <p className="text-sm text-ink/70">
        Số tiền thanh toán khi nhận hàng: <strong className="text-base text-brand-forest">{formatVND(total)}</strong>
      </p>
    )}
    <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed max-w-xl mx-auto">
      Shop sẽ gọi xác nhận trước khi giao. Đơn hàng sẽ được giao đến bạn trong 2-4 ngày tuỳ khu vực. Salt &amp; Light xin cảm
      ơn!
    </p>
  </div>
);

/** One screen per payment method, sharing the order number up top and the links below. */
export const OrderConfirmationContent = ({ orderNumber, method, total, transfer }: OrderConfirmationContentProps) => (
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

    {method === "bank_transfer" && <BankTransferSteps orderNumber={orderNumber} total={total} transfer={transfer} />}
    {method === "cod" && <CodSteps total={total} />}

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

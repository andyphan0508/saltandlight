import Image from "next/image";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";

export default function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; transferContent?: string; qrUrl?: string };
}) {
  const total = Number(searchParams.total ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-black uppercase">Đặt hàng thành công!</h1>
      <p className="mt-2 text-ink/60">
        Mã đơn hàng: <span className="font-semibold text-ink">{params.orderNumber}</span>
      </p>

      <div className="mt-8 rounded-3xl bg-mint-100 p-8">
        <h2 className="text-sm font-bold uppercase">Chuyển khoản ngân hàng</h2>
        <p className="mt-1 text-sm text-ink/60">
          Quét mã QR bằng app ngân hàng bất kỳ hoặc chuyển khoản thủ công theo thông tin bên
          dưới.
        </p>

        {searchParams.qrUrl ? (
          <div className="relative mx-auto mt-6 h-64 w-64 overflow-hidden rounded-2xl bg-white">
            <Image src={searchParams.qrUrl} alt="Mã QR chuyển khoản" fill className="object-contain p-4" />
          </div>
        ) : (
          <p className="mt-6 text-sm text-sale">
            Chưa cấu hình VietQR — vui lòng chuyển khoản thủ công và liên hệ shop để đối soát.
          </p>
        )}

        <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          <Row label="Số tiền" value={formatVND(total)} />
          <Row label="Nội dung chuyển khoản" value={searchParams.transferContent ?? params.orderNumber} />
        </dl>

        <p className="mt-4 text-xs text-ink/50">
          Sau khi shop xác nhận đã nhận được tiền, đơn hàng sẽ chuyển sang trạng thái &ldquo;Đang xử
          lý&rdquo; và bạn sẽ nhận được email xác nhận.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/san-pham">
          <Button variant="outline">Tiếp tục mua sắm</Button>
        </Link>
        <Link href="/tra-cuu-don-hang">
          <Button>Tra cứu đơn hàng</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink/10 pb-2">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

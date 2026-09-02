"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import {
  Check,
  Copy,
  Truck,
  ShieldCheck,
  Phone,
  ArrowRight,
  CrossIcon,
} from "@/components/Icons";

export default function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; transferContent?: string; qrUrl?: string };
}) {
  const total = Number(searchParams.total ?? 0);
  const transferContent = searchParams.transferContent ?? params.orderNumber;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16 space-y-10 text-center">
      {/* Success Badge & Title */}
      <div className="space-y-3">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-md">
          <Check size={38} />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-sm text-ink/70">
          Cảm ơn bạn đã lựa chọn Salt &amp; Light. Mã đơn hàng của bạn là:
        </p>
        <div className="inline-block rounded-full bg-ink px-6 py-2 text-sm font-black uppercase tracking-wider text-white shadow-sm">
          #{params.orderNumber}
        </div>
      </div>

      {/* VietQR Payment Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-card border border-ink/5 space-y-6 text-left">
        <div className="border-b border-ink/10 pb-4 text-center sm:text-left">
          <h2 className="font-display text-lg font-black uppercase text-ink flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck size={20} className="text-brand-forest" />
            Thanh Toán Chuyển Khoản Ngân Hàng (VietQR)
          </h2>
          <p className="text-xs text-ink/60 mt-1">
            Quét mã QR bằng App Ngân hàng bất kỳ hoặc chuyển khoản với thông tin dưới đây:
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-12 items-center">
          {/* QR Image Box */}
          <div className="sm:col-span-5 flex flex-col items-center">
            {searchParams.qrUrl ? (
              <div className="relative h-64 w-64 overflow-hidden rounded-2xl bg-white border border-ink/10 p-2 shadow-sm">
                <Image
                  src={searchParams.qrUrl}
                  alt="Mã VietQR thanh toán"
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex h-64 w-64 flex-col items-center justify-center rounded-2xl bg-mint-50 p-4 text-center text-xs text-ink/60 border border-mint-200">
                <CrossIcon size={24} className="text-brand-forest mb-2" />
                <span>Vui lòng chuyển khoản thủ công theo thông tin bên cạnh</span>
              </div>
            )}
            <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-brand-forest">
              Mã QR Chuẩn Napas 24/7
            </span>
          </div>

          {/* Copyable Details */}
          <div className="sm:col-span-7 space-y-3.5 text-xs">
            <CopyField
              label="Số tiền cần thanh toán"
              value={formatVND(total)}
              rawText={String(total)}
              copied={copiedKey === "total"}
              onCopy={() => copyToClipboard(String(total), "total")}
              highlight
            />

            <CopyField
              label="Nội dung chuyển khoản (Memo)"
              value={transferContent}
              rawText={transferContent}
              copied={copiedKey === "memo"}
              onCopy={() => copyToClipboard(transferContent, "memo")}
              highlight
            />

            <div className="rounded-2xl bg-cream p-4 space-y-1.5 text-ink/70 border border-ink/5">
              <p className="font-bold text-ink">💡 Lưu ý quan trọng:</p>
              <p>
                Sau khi nhận được chuyển khoản, shop sẽ xác nhận đơn và gửi tin nhắn/email thông báo cho bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div className="rounded-3xl bg-mint-50/70 p-6 sm:p-8 border border-mint-200/60 text-left space-y-4">
        <h3 className="font-display text-sm font-black uppercase text-ink">
          Quy Trình Xử Lý Đơn Hàng
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-ink/75">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-ink/5">
            <span className="font-bold text-brand-forest">Bước 1:</span>
            <p className="mt-1 font-semibold text-ink">Xác nhận thanh toán</p>
            <p className="mt-0.5 text-[11px] text-ink/50">Hệ thống tự động kiểm tra sao kê ngân hàng.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-ink/5">
            <span className="font-bold text-brand-forest">Bước 2:</span>
            <p className="mt-1 font-semibold text-ink">Đóng gói cẩn thận</p>
            <p className="mt-0.5 text-[11px] text-ink/50">Kiểm tra size, màu, kèm thiệp Lời Chúa.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-ink/5">
            <span className="font-bold text-brand-forest">Bước 3:</span>
            <p className="mt-1 font-semibold text-ink">Giao hàng tận tay</p>
            <p className="mt-0.5 text-[11px] text-ink/50">Shipper liên hệ giao trong 2-4 ngày làm việc.</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
        <Link href="/san-pham">
          <Button variant="outline" size="md">
            Tiếp tục mua sắm
          </Button>
        </Link>
        <Link href="/tra-cuu-don-hang">
          <Button variant="primary" size="md" className="shadow-md">
            Tra cứu trạng thái đơn hàng
          </Button>
        </Link>
      </div>

      <div className="pt-4 text-xs text-ink/50 flex items-center justify-center gap-2">
        <Phone size={14} />
        <span>Cần hỗ trợ gấp? Gọi ngay hotline <strong>0847 25 2025</strong></span>
      </div>
    </div>
  );
}

function CopyField({
  label,
  value,
  rawText,
  copied,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  rawText: string;
  copied: boolean;
  onCopy: () => void;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-3.5 flex items-center justify-between shadow-sm">
      <div>
        <span className="text-[11px] font-semibold text-ink/50 block uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-black ${highlight ? "text-brand-forest text-base" : "text-ink"}`}>
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
          copied
            ? "bg-emerald-100 text-emerald-800"
            : "bg-ink-100 text-ink hover:bg-ink hover:text-white"
        }`}
      >
        {copied ? (
          <>
            <Check size={12} />
            <span>Đã chép</span>
          </>
        ) : (
          <>
            <Copy size={12} />
            <span>Sao chép</span>
          </>
        )}
      </button>
    </div>
  );
}

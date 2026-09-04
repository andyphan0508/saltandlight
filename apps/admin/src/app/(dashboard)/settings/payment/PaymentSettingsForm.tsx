"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { Upload, ImageOff, CheckCircle } from "@/components/Icons";
import { toast } from "sonner";

export interface PaymentSettingsData {
  qrImageUrl: string | null;
  transferNote: string | null;
  showThankYouOnly: boolean;
  thankYouMessage: string | null;
}

const DEFAULT_THANK_YOU =
  "Cảm ơn quý khách đã đặt đơn, quý khách vui lòng check điện thoại shop sẽ liên hệ bạn nhé.";
const DEFAULT_TRANSFER_NOTE =
  "Vui lòng ghi đúng mã đơn hàng trong nội dung chuyển khoản để shop xác nhận đơn nhanh và chính xác nhất.";

export function PaymentSettingsForm({ initialSettings }: { initialSettings: PaymentSettingsData | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrImageUrl, setQrImageUrl] = useState(initialSettings?.qrImageUrl ?? "");
  const [transferNote, setTransferNote] = useState(initialSettings?.transferNote ?? DEFAULT_TRANSFER_NOTE);
  const [showThankYouOnly, setShowThankYouOnly] = useState(initialSettings?.showThankYouOnly ?? false);
  const [thankYouMessage, setThankYouMessage] = useState(initialSettings?.thankYouMessage ?? DEFAULT_THANK_YOU);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
      setQrImageUrl(data.url);
      toast.success("Tải mã QR lên thành công!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrImageUrl: qrImageUrl.trim() || null,
          transferNote: transferNote.trim() || null,
          showThankYouOnly,
          thankYouMessage: thankYouMessage.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      toast.success("Đã lưu cài đặt thanh toán!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
      )}

      {/* Mode switch */}
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ink">Chỉ hiển thị lời cảm ơn (bỏ qua QR/chuyển khoản)</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Khi bật, trang xác nhận đơn hàng sẽ ẩn toàn bộ khối mã QR &amp; hướng dẫn chuyển khoản, chỉ hiển thị
              thông báo cảm ơn bên dưới — dùng khi bạn muốn tự liên hệ khách qua điện thoại thay vì để khách chuyển khoản ngay.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowThankYouOnly((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              showThankYouOnly ? "bg-brand-forest" : "bg-slate-200"
            }`}
            aria-pressed={showThankYouOnly}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                showThankYouOnly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {showThankYouOnly && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung lời cảm ơn</label>
            <textarea
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* QR & transfer note — only meaningful when the switch above is off */}
      <div className={`rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4 ${showThankYouOnly ? "opacity-50" : ""}`}>
        <h3 className="text-sm font-bold text-ink">Mã QR &amp; hướng dẫn chuyển khoản</h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh mã QR (ưu tiên hơn QR tự sinh)</label>
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
              {qrImageUrl ? (
                <Image src={qrImageUrl} alt="Mã QR thanh toán" fill className="object-contain p-2" />
              ) : (
                <ImageOff size={24} className="text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs px-3.5 py-2 rounded-xl font-medium border-slate-200 hover:bg-slate-50"
              >
                <Upload size={14} className="mr-1" />
                {isUploading ? "Đang tải..." : "Tải ảnh QR lên"}
              </Button>
              {qrImageUrl && (
                <button
                  type="button"
                  onClick={() => setQrImageUrl("")}
                  className="block text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  Gỡ ảnh, dùng QR tự sinh từ VietQR
                </button>
              )}
              <p className="text-[11px] text-slate-400">Không tải ảnh: hệ thống dùng mã VietQR tự sinh theo tài khoản ngân hàng cấu hình sẵn.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú hướng dẫn chuyển khoản</label>
          <textarea
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            rows={3}
            placeholder={DEFAULT_TRANSFER_NOTE}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Hiển thị ngay dưới ô mã đơn hàng trên trang xác nhận, để khách ghi đúng nội dung chuyển khoản.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl px-5 py-2.5 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs inline-flex items-center gap-1.5"
        >
          <CheckCircle size={15} />
          {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}

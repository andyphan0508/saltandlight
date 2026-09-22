"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { Upload, ImageOff, CheckCircle } from "@/components/admin/Icons";
import { toast } from "sonner";
import { uploadImage } from "@/api/upload-image";
import { adminFetch } from "@/api/admin-fetch";

export interface PaymentSettingsData {
  qrImageUrl: string | null;
  transferNote: string | null;
}

/** What bank-transfer customers see on the order-success page: a QR image and the transfer details. */
export const PaymentSettingsForm = ({ initialSettings }: { initialSettings: PaymentSettingsData | null }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrImageUrl, setQrImageUrl] = useState(initialSettings?.qrImageUrl ?? "");
  const [transferNote, setTransferNote] = useState(initialSettings?.transferNote ?? "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      setQrImageUrl(await uploadImage(file));
      toast.success("Tải mã QR lên thành công!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await adminFetch("/api/admin/settings/payment", {
        method: "PATCH",
        body: {
          qrImageUrl: qrImageUrl.trim() || null,
          transferNote: transferNote.trim() || null,
        },
      });
      toast.success("Đã lưu cài đặt thanh toán!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
      )}

      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Thông tin chuyển khoản</h3>
          <p className="mt-1 text-xs text-slate-500">
            Hiện trên trang đặt hàng thành công, chỉ với đơn chọn chuyển khoản. Để trống cả hai thì khách chỉ thấy lời cảm ơn.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh mã QR</label>
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
                onChange={onFileUpload}
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
                {isUploading ? "Đang tải..." : qrImageUrl ? "Đổi ảnh QR" : "Tải ảnh QR lên"}
              </Button>
              {qrImageUrl && (
                <button
                  type="button"
                  onClick={() => setQrImageUrl("")}
                  className="block text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  Gỡ ảnh QR
                </button>
              )}
              <p className="text-[11px] text-slate-400">Ảnh QR tải từ app ngân hàng của shop (JPG, PNG hoặc WebP).</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung hiển thị</label>
          <textarea
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            rows={5}
            placeholder={"Ví dụ:\nNgân hàng: Vietcombank\nSố tài khoản: 0123456789\nChủ tài khoản: SALT AND LIGHT\nNội dung: ghi mã đơn hàng"}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Xuống dòng thế nào thì trang hiển thị y như vậy. Trang tự hiện kèm mã đơn và số tiền của từng đơn.
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
};

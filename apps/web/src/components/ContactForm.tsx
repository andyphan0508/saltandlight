"use client";

import { useState, useRef, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { Check } from "./Icons";
import { TurnstileWidget, type TurnstileWidgetRef } from "./TurnstileWidget";

interface ContactFormProps {
  type: "contact" | "custom_order";
}

export const ContactForm = ({ type }: ContactFormProps) => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const isSending = status === "sending";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!turnstileToken) {
      setErrorMessage("Vui lòng tích vào ô xác nhận bảo mật bên dưới trước khi gửi.");
      return;
    }

    setStatus("sending");
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          email: form.get("email"),
          message: form.get("message"),
          turnstileToken,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus("sent");
        formEl.reset();
        setTurnstileToken("");
      } else {
        const errorMsg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.formErrors?.[0] ||
              "Có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại.";
        setErrorMessage(errorMsg);
        setStatus("error");
        turnstileRef.current?.reset();
        setTurnstileToken("");
      }
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
      setStatus("error");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-3xl bg-mint-100 p-8 text-center space-y-3 border border-mint-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-forest text-white">
          <Check size={24} />
        </div>
        <h4 className="font-display text-lg font-bold uppercase text-ink">
          Gửi Yêu Cầu Thành Công!
        </h4>
        <p className="text-xs sm:text-sm text-ink/75 max-w-sm mx-auto">
          Cảm ơn bạn! Đội ngũ Salt &amp; Light đã nhận được thông tin và sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ làm việc.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
          Họ và tên của bạn <span className="text-sale">*</span>
        </label>
        <input
          name="fullName"
          placeholder="Ví dụ: Anh/Chị Nguyễn Văn A"
          required
          className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
            Số điện thoại / Zalo <span className="text-sale">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="0912 345 678"
            required
            className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
            Địa chỉ Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="email@example.com"
            className="mt-1.5 w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm focus:border-ink focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
          {type === "custom_order" ? "Chi tiết yêu cầu đặt áo / quà tặng" : "Nội dung cần hỗ trợ"}{" "}
          <span className="text-sale">*</span>
        </label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder={
            type === "custom_order"
              ? "Vui lòng mô tả: Số lượng dự kiến, câu Kinh Thánh/logo muốn in, ngày cần nhận hàng, màu sắc mong muốn..."
              : "Nội dung bạn muốn nhắn gửi cho Salt & Light..."
          }
          className="mt-1.5 w-full rounded-2xl border border-ink/15 p-3.5 text-sm focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      {/* Cloudflare Turnstile bot verification */}
      <div className="pt-1">
        <TurnstileWidget
          ref={turnstileRef}
          onVerify={(tok) => {
            setTurnstileToken(tok);
            setErrorMessage(null);
          }}
          onExpire={() => setTurnstileToken("")}
          onError={() => {
            setTurnstileToken("");
            setErrorMessage("Không thể tải mã bảo mật. Vui lòng thử tải lại trang.");
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isSending}
        variant="primary"
        size="lg"
        className="w-full shadow-md py-3.5"
      >
        {isSending ? "Đang gửi yêu cầu…" : "Gửi thông tin cho chúng mình"}
      </Button>

      {errorMessage && (
        <p className="text-xs font-semibold text-sale text-center animate-fade-in">
          {errorMessage}
        </p>
      )}
    </form>
  );
};

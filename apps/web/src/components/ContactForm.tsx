"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { Check, ShieldCheck, Phone, Mail } from "./Icons";

export function ContactForm({ type }: { type: "contact" | "custom_order" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        fullName: form.get("fullName"),
        phone: form.get("phone"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    if (res.ok) {
      setStatus("sent");
      e.currentTarget.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl bg-mint-100 p-8 text-center space-y-3 border border-mint-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-forest text-white">
          <Check size={24} />
        </div>
        <h4 className="font-display text-lg font-black uppercase text-ink">
          Gửi Yêu Cầu Thành Công!
        </h4>
        <p className="text-xs sm:text-sm text-ink/75 max-w-sm mx-auto">
          Cảm ơn bạn! Đội ngũ Salt &amp; Light đã nhận được thông tin và sẽ liên hệ hỗ trợ bạn trong vòng 24 giờ làm việc.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <Button
        type="submit"
        disabled={status === "sending"}
        variant="primary"
        size="lg"
        className="w-full shadow-md py-3.5"
      >
        {status === "sending" ? "Đang gửi yêu cầu…" : "Gửi thông tin cho chúng mình"}
      </Button>

      {status === "error" && (
        <p className="text-xs font-semibold text-sale text-center">
          Có lỗi xảy ra trong quá trình gửi, vui lòng liên hệ hotline 0847 25 2025.
        </p>
      )}
    </form>
  );
}

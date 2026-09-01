"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";

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
      <p className="rounded-2xl bg-mint-100 p-6 text-center text-sm">
        Cảm ơn bạn! Chúng mình đã nhận được yêu cầu và sẽ phản hồi sớm nhất có thể.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="fullName"
        placeholder="Họ và tên"
        required
        className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          name="phone"
          placeholder="Số điện thoại"
          className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
        />
      </div>
      <textarea
        name="message"
        rows={5}
        required
        placeholder={
          type === "custom_order"
            ? "Mô tả yêu cầu đặt theo yêu cầu của bạn (số lượng, thiết kế, thời gian mong muốn...)"
            : "Nội dung liên hệ"
        }
        className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm"
      />
      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-sale">Có lỗi xảy ra, vui lòng thử lại.</p>
      )}
    </form>
  );
}

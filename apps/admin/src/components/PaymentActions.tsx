"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@saltandlight/ui";

export function PaymentActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);

  async function act(action: "confirm" | "reject") {
    if (action === "reject" && !confirm("Từ chối giao dịch này?")) return;
    setLoading(action);
    await fetch(`/api/admin/payments/${paymentId}/${action}`, { method: "PATCH" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act("confirm")} disabled={loading !== null}>
        {loading === "confirm" ? "Đang xác nhận…" : "Xác nhận đã nhận tiền"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => act("reject")} disabled={loading !== null}>
        Từ chối
      </Button>
    </div>
  );
}

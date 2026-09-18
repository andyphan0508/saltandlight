"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";

export const PaymentActions = ({ paymentId }: { paymentId: string }) => {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"confirm" | "reject" | null>(null);

  const onAction = async (action: "confirm" | "reject") => {
    if (action === "reject" && !confirm("Từ chối giao dịch này?")) return;
    setPendingAction(action);
    try {
      await adminFetch(`/api/admin/payments/${paymentId}/${action}`, { method: "PATCH" });
      toast.success(action === "confirm" ? "Đã xác nhận thanh toán" : "Đã từ chối giao dịch");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật giao dịch");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-2 sm:flex">
      <Button size="sm" className="min-h-11 sm:min-h-0" onClick={() => onAction("confirm")} disabled={pendingAction !== null}>
        {pendingAction === "confirm" ? "Đang xác nhận…" : "Xác nhận đã nhận tiền"}
      </Button>
      <Button size="sm" variant="outline" className="min-h-11 sm:min-h-0" onClick={() => onAction("reject")} disabled={pendingAction !== null}>
        Từ chối
      </Button>
    </div>
  );
};

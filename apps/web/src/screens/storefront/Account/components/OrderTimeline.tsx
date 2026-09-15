import { ORDER_STATUS_LABELS, type OrderStatusValue } from "@saltandlight/domain";
import type { OrderStatusStep } from "@/interfaces/customer-order";

const formatStepDate = (value: string) =>
  new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

/** Vertical timeline of an order's status changes. */
export const OrderTimeline = ({ steps }: { steps: OrderStatusStep[] }) => (
  <div className="rounded-2xl border border-ink/10 bg-mint-50/50 p-4 space-y-3 animate-fade-in">
    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/70">Hành Trình Đơn Hàng</h4>
    <div className="relative border-l-2 border-brand-forest/20 ml-2.5 pl-4 space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="relative">
          <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-forest shadow-xs" />
          <div className="text-xs">
            <span className="font-bold text-ink">{ORDER_STATUS_LABELS[step.toStatus as OrderStatusValue] ?? step.toStatus}</span>
            <span className="ml-2 text-[11px] text-ink/45">{formatStepDate(step.changedAt)}</span>
            {step.note && <p className="mt-0.5 text-xs text-ink/65 italic">{step.note}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

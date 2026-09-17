import type { SourceSummary } from "@/helpers/analytics/sessions";
import { formatDuration, formatInt, formatPercent } from "../format";

/** Traffic by source with the numbers that tell a real audience from wasted clicks, and each ad campaign underneath. */
export const SourcesTable = ({ sources }: { sources: SourceSummary[] }) => {
  if (sources.length === 0) return <p className="text-xs text-slate-400">Chưa có dữ liệu nguồn truy cập.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-xs tabular-nums">
        <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2 pr-3 font-semibold">Nguồn</th>
            <th className="py-2 pr-3 text-right font-semibold">Phiên</th>
            <th className="py-2 pr-3 text-right font-semibold" title="Bot, trình duyệt tự động hoặc IP máy chủ">Nghi ảo</th>
            <th className="py-2 pr-3 text-right font-semibold" title="1 trang, dưới 3 giây, gần như không cuộn">Thoát ngay</th>
            <th className="py-2 pr-3 text-right font-semibold" title="Rời đi sau 1 trang mà không tương tác">Tỷ lệ thoát</th>
            <th className="py-2 pr-3 text-right font-semibold">TG trung bình</th>
            <th className="py-2 pr-3 text-right font-semibold">Thêm giỏ</th>
            <th className="py-2 pr-3 text-right font-semibold">Đặt hàng</th>
            <th className="py-2 text-right font-semibold">Chuyển đổi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {sources.map((s) => (
            <SourceRows key={s.source} source={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const warnClass = (rate: number, warnAt: number) => (rate >= warnAt ? "font-bold text-[#d03b3b]" : "");

const SourceRows = ({ source: s }: { source: SourceSummary }) => (
  <>
    <tr>
      <td className="py-2 pr-3 font-semibold text-slate-900">{s.label}</td>
      <td className="py-2 pr-3 text-right">{formatInt(s.sessions)}</td>
      <td className={`py-2 pr-3 text-right ${warnClass(s.suspectRate, 0.2)}`}>{formatPercent(s.suspectRate)}</td>
      <td className={`py-2 pr-3 text-right ${warnClass(s.instantExitRate, 0.4)}`}>{formatPercent(s.instantExitRate)}</td>
      <td className="py-2 pr-3 text-right">{formatPercent(s.bounceRate)}</td>
      <td className="py-2 pr-3 text-right">{formatDuration(s.avgDurationMs)}</td>
      <td className="py-2 pr-3 text-right">{formatInt(s.cartSessions)}</td>
      <td className="py-2 pr-3 text-right">{formatInt(s.orderSessions)}</td>
      <td className="py-2 text-right font-semibold">{formatPercent(s.conversionRate)}</td>
    </tr>
    {s.campaigns.slice(0, 5).map((c) => (
      <tr key={`${s.source}-${c.campaign}`} className="bg-slate-50/60 text-slate-500">
        <td className="py-1.5 pl-4 pr-3">↳ Chiến dịch: {c.campaign}</td>
        <td className="py-1.5 pr-3 text-right">{formatInt(c.sessions)}</td>
        <td className={`py-1.5 pr-3 text-right ${warnClass(c.instantExitRate, 0.5)}`} colSpan={2}>
          {formatPercent(c.instantExitRate)} ảo/thoát ngay
        </td>
        <td className="py-1.5 pr-3" colSpan={3} />
        <td className="py-1.5 pr-3 text-right">{formatInt(c.orderSessions)}</td>
        <td className="py-1.5" />
      </tr>
    ))}
  </>
);

import type { SourceSummary } from "@/helpers/analytics/sessions";
import { formatDuration, formatInt, formatPercent } from "../format";

const warnClass = (rate: number, warnAt: number) => (rate >= warnAt ? "font-semibold text-[#b42323]" : "");

const Figure = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div>
    <dt className="text-[10px] text-slate-500">{label}</dt>
    <dd className={`text-slate-700 ${className}`}>{value}</dd>
  </div>
);

/**
 * Traffic by source with the numbers that tell a real audience from wasted clicks, and
 * each ad campaign underneath. A table on wide screens; on a phone each source is a card
 * with its campaigns listed inside it, since nine columns don't fit.
 */
export const SourcesTable = ({ sources }: { sources: SourceSummary[] }) => {
  if (sources.length === 0) return <p className="text-xs text-slate-400">Chưa có dữ liệu nguồn truy cập.</p>;
  return (
    <>
      <ul className="divide-y divide-slate-100 md:hidden">
        {sources.map((s) => (
          <li key={s.source} className="py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-slate-900">{s.label}</span>
              <span className="text-xs tabular-nums text-slate-500">
                <b className="text-sm font-semibold text-slate-900">{formatInt(s.sessions)}</b> phiên
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-x-2 gap-y-2 text-xs tabular-nums">
              <Figure label="Nghi ảo" value={formatPercent(s.suspectRate)} className={warnClass(s.suspectRate, 0.2)} />
              <Figure label="Thoát ngay" value={formatPercent(s.instantExitRate)} className={warnClass(s.instantExitRate, 0.4)} />
              <Figure label="Tỷ lệ thoát" value={formatPercent(s.bounceRate)} />
              <Figure label="TG trung bình" value={formatDuration(s.avgDurationMs)} />
              <Figure label="Thêm giỏ · Đặt" value={`${formatInt(s.cartSessions)} · ${formatInt(s.orderSessions)}`} />
              <Figure label="Chuyển đổi" value={formatPercent(s.conversionRate)} className="font-semibold text-slate-900" />
            </dl>
            {s.campaigns.length > 0 && (
              <ul className="mt-2.5 space-y-1 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                {s.campaigns.slice(0, 5).map((c) => (
                  <li key={c.campaign} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate">Chiến dịch: {c.campaign}</span>
                    <span className="flex-shrink-0 tabular-nums">
                      {formatInt(c.sessions)} phiên · <span className={warnClass(c.instantExitRate, 0.5)}>{formatPercent(c.instantExitRate)} ảo</span> ·{" "}
                      {formatInt(c.orderSessions)} đơn
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-xs tabular-nums">
          <thead className="border-b border-slate-100 text-[11px] text-slate-500">
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
    </>
  );
};

const SourceRows = ({ source: s }: { source: SourceSummary }) => (
  <>
    <tr>
      <td className="py-2.5 pr-3 font-semibold text-slate-900">{s.label}</td>
      <td className="py-2.5 pr-3 text-right">{formatInt(s.sessions)}</td>
      <td className={`py-2.5 pr-3 text-right ${warnClass(s.suspectRate, 0.2)}`}>{formatPercent(s.suspectRate)}</td>
      <td className={`py-2.5 pr-3 text-right ${warnClass(s.instantExitRate, 0.4)}`}>{formatPercent(s.instantExitRate)}</td>
      <td className="py-2.5 pr-3 text-right">{formatPercent(s.bounceRate)}</td>
      <td className="py-2.5 pr-3 text-right">{formatDuration(s.avgDurationMs)}</td>
      <td className="py-2.5 pr-3 text-right">{formatInt(s.cartSessions)}</td>
      <td className="py-2.5 pr-3 text-right">{formatInt(s.orderSessions)}</td>
      <td className="py-2.5 text-right font-semibold">{formatPercent(s.conversionRate)}</td>
    </tr>
    {s.campaigns.slice(0, 5).map((c) => (
      <tr key={`${s.source}-${c.campaign}`} className="bg-slate-50/60 text-slate-500">
        <td className="py-1.5 pl-4 pr-3">Chiến dịch: {c.campaign}</td>
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

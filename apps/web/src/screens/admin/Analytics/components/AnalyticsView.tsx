import { PageHeader } from "@/components/admin/PageHeader";
import { StatsSwitch } from "@/components/admin/StatsSwitch";
import { AlertTriangle, CheckCircle, Clock, Shield } from "@/components/admin/Icons";
import type { AnalyticsRangeId } from "@/helpers/analytics/ranges";
import { vietnamDaysBetween } from "@/helpers/analytics/product-activity";
import { judgeAdsTraffic } from "@/helpers/analytics/verdict";
import type { TrafficReport } from "@/server/analytics/report";
import { AbandonedProducts } from "./AbandonedProducts";
import { Card } from "./Card";
import { ProductViews } from "./ProductViews";
import { ProductActivityChart } from "./ProductActivityChart";
import { Funnel } from "./Funnel";
import { KpiTile } from "./KpiTile";
import { QualityBar } from "./QualityBar";
import { RangeFrame } from "./RangeFrame";
import { SetupNotice } from "./SetupNotice";
import { SourcesTable } from "./SourcesTable";
import { TrafficTimeChart, type TimeBucket } from "./TrafficTimeChart";
import { UtmLinkBuilder } from "./UtmLinkBuilder";
import { formatDurationShort, formatInt, formatPercent, formatVnd } from "../format";

const VERDICT_STYLE = {
  good: { tone: "bg-emerald-50 text-emerald-900 ring-emerald-600/15", iconTone: "bg-emerald-600 text-white", Icon: CheckCircle, label: "Traffic quảng cáo tốt" },
  warning: { tone: "bg-amber-50 text-amber-950 ring-amber-600/20", iconTone: "bg-amber-500 text-white", Icon: AlertTriangle, label: "Cần theo dõi" },
  critical: { tone: "bg-rose-50 text-rose-950 ring-rose-600/20", iconTone: "bg-rose-600 text-white", Icon: Shield, label: "Nghi phân phối lỗi / click ảo" },
  insufficient: { tone: "bg-slate-50 text-slate-900 ring-slate-900/[0.06]", iconTone: "bg-slate-200 text-slate-600", Icon: Clock, label: "Chưa đủ dữ liệu" },
} as const;

/**
 * The traffic report, most-asked first: what sold (straight from the orders table, so it
 * shows even while analytics reading is down), whether the ads are sound, how many came,
 * then the detail. On a phone that puts the answer to "how did we do" on the first screen.
 */
export const AnalyticsView = ({ report, rangeId }: { report: TrafficReport; rangeId: AnalyticsRangeId }) => {
  const { window, orders, previousOrders } = report;

  return (
    <>
      <div className="mb-6 lg:hidden">
        <StatsSwitch current="/admin/analytics" />
      </div>
      <PageHeader
        title="Thống kê truy cập"
        subtitle="Khách vào từ đâu, lúc nào, có mua không, và bao nhiêu lượt là click ảo. Cập nhật mỗi 5 phút."
      />

      <RangeFrame rangeId={rangeId}>
        <Card title="Đơn hàng trong kỳ" subtitle="Lấy trực tiếp từ database — luôn đầy đủ, kể cả khi khách chặn theo dõi.">
          {/* Revenue leads two columns wide: 2 + 7 tiles fill three rows of three exactly */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiTile
              isHero
              label="Doanh thu (đơn đã xác nhận)"
              value={formatVnd(orders.revenue)}
              current={orders.revenue}
              previous={previousOrders.revenue}
              kind="count"
            />
            <KpiTile label="Đơn đã đặt" value={formatInt(orders.orders)} current={orders.orders} previous={previousOrders.orders} kind="count" />
            <KpiTile label="Người mua" value={formatInt(orders.buyers)} current={orders.buyers} previous={previousOrders.buyers} kind="count" />
            <KpiTile label="Sản phẩm đã bán" value={formatInt(orders.itemsSold)} current={orders.itemsSold} previous={previousOrders.itemsSold} kind="count" />
            <KpiTile
              label="Tỷ lệ đơn được xác nhận"
              value={formatPercent(orders.confirmationRate)}
              current={orders.confirmationRate}
              previous={previousOrders.confirmationRate}
              kind="rate"
            />
            <KpiTile
              label="Tỷ lệ khách mua lại"
              value={formatPercent(orders.repeatBuyerRate)}
              current={orders.repeatBuyerRate}
              previous={previousOrders.repeatBuyerRate}
              kind="rate"
              hint="Người mua trong kỳ đã từng đặt hàng trước đó (nhận diện theo số điện thoại)"
            />
            <KpiTile label="Đơn COD" value={formatInt(orders.codOrders)} current={orders.codOrders} previous={previousOrders.codOrders} kind="count" />
            <KpiTile
              label="Đơn chuyển khoản"
              value={formatInt(orders.transferOrders)}
              current={orders.transferOrders}
              previous={previousOrders.transferOrders}
              kind="count"
              className="max-sm:col-span-2"
            />
          </div>
        </Card>

        {report.status !== "ok" && <SetupNotice reason={report.status} message={report.status === "error" ? report.message : undefined} />}

        {report.status === "ok" && (
          <>
            {(() => {
              const verdict = judgeAdsTraffic(report.current.sources);
              const style = VERDICT_STYLE[verdict.level];
              return (
                <section className={`analytics-rise flex items-start gap-3 rounded-[1.5rem] p-4 ring-1 sm:p-5 ${style.tone}`}>
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.iconTone}`} aria-hidden="true">
                    <style.Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{style.label}</h2>
                    <p className="mt-0.5 text-xs leading-relaxed opacity-80">{verdict.message}</p>
                  </div>
                </section>
              );
            })()}

            <div className="analytics-rise grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiTile label="Khách truy cập" value={formatInt(report.current.visitors)} current={report.current.visitors} previous={report.previous.visitors} kind="count" />
              <KpiTile label="Lượt truy cập (phiên)" value={formatInt(report.current.sessions)} current={report.current.sessions} previous={report.previous.sessions} kind="count" />
              <KpiTile label="Lượt xem trang" value={formatInt(report.current.pageViews)} current={report.current.pageViews} previous={report.previous.pageViews} kind="count" />
              <KpiTile
                label="Thời gian xem trung bình"
                value={formatDurationShort(report.current.avgDurationMs)}
                current={report.current.avgDurationMs}
                previous={report.previous.avgDurationMs}
                kind="count"
              />
              <KpiTile
                label="Tỷ lệ thoát"
                value={formatPercent(report.current.bounceRate)}
                current={report.current.bounceRate}
                previous={report.previous.bounceRate}
                kind="rate"
                isHigherBetter={false}
                hint="Phiên thật chỉ xem 1 trang và rời đi mà không tương tác (không tính bot)"
              />
              <KpiTile
                label="Thoát ngay dưới 3 giây"
                value={formatPercent(report.current.instantExitRate)}
                current={report.current.instantExitRate}
                previous={report.previous.instantExitRate}
                kind="rate"
                isHigherBetter={false}
                hint="Dấu hiệu điển hình của click nhầm / click ảo từ quảng cáo"
              />
              <KpiTile
                label="Nghi bot / click ảo"
                value={formatPercent(report.current.suspectRate)}
                current={report.current.suspectRate}
                previous={report.previous.suspectRate}
                kind="rate"
                isHigherBetter={false}
                hint="Bot, trình duyệt tự động, hoặc truy cập từ IP máy chủ (AWS, Google Cloud…)"
              />
              <KpiTile
                label="Tỷ lệ chuyển đổi"
                value={formatPercent(report.current.conversionRate, 2)}
                current={report.current.conversionRate}
                previous={report.previous.conversionRate}
                kind="rate"
                hint="Phiên thật có đặt hàng ÷ phiên thật"
              />
            </div>

            <Card
              title={window.isSingleDay ? "Khách đổ về theo giờ" : "Khách đổ về theo ngày"}
              subtitle={
                window.isSingleDay
                  ? "Giờ Việt Nam. Bật quảng cáo lúc 15h thì cột xanh từ 15h trở đi cho thấy khách từ ads đổ về bao nhiêu."
                  : "Mỗi cột là một ngày; phần xanh là khách đến từ quảng cáo. Chọn Hôm nay / Hôm qua để xem theo giờ."
              }
            >
              <TrafficTimeChart
                caption={window.isSingleDay ? "Số phiên theo giờ, chia quảng cáo và nguồn khác" : "Số phiên theo ngày, chia quảng cáo và nguồn khác"}
                buckets={
                  window.isSingleDay
                    ? report.current.byHour.map<TimeBucket>((h) => ({
                        label: `${h.hour}:00 – ${h.hour}:59`,
                        tick: h.hour % 3 === 0 ? `${h.hour}h` : "",
                        paid: h.paid,
                        other: h.other,
                      }))
                    : vietnamDaysBetween(window.start, window.end).map<TimeBucket>((day, i, all) => {
                        const found = report.current.byDay.find((d) => d.day === day);
                        return {
                          label: day.split("-").reverse().join("/"),
                          tick: all.length <= 10 || i % 5 === 0 ? day.slice(8) + "/" + day.slice(5, 7) : "",
                          paid: found?.paid ?? 0,
                          other: (found?.sessions ?? 0) - (found?.paid ?? 0),
                        };
                      })
                }
              />
            </Card>

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
              <Card title="Chất lượng lượt truy cập" subtitle="Tách khách thật khỏi bot và click thoát ngay — nhất là với traffic từ quảng cáo.">
                <QualityBar quality={report.current.quality} />
              </Card>
              <Card title="Phễu mua hàng" subtitle="Khách rơi rụng ở bước nào (chỉ tính phiên thật, không tính bot).">
                <Funnel
                  steps={[
                    { label: "Vào website", value: report.current.humanSessions },
                    { label: "Xem sản phẩm", value: report.current.productViewSessions },
                    { label: "Thêm vào giỏ", value: report.current.cartSessions },
                    { label: "Vào trang thanh toán", value: report.current.checkoutSessions },
                    { label: "Đặt hàng", value: report.current.orderSessions },
                  ]}
                />
              </Card>
            </div>

            <Card title="Nguồn truy cập & chiến dịch" subtitle="Nguồn nào mang khách thật, nguồn nào toàn click thoát ngay. Cột đỏ là con số đáng lo.">
              <SourcesTable sources={report.current.sources} />
            </Card>

            <Card
              title="Tương tác với sản phẩm"
              subtitle={
                window.isSingleDay
                  ? "Mỗi giờ khách xem, thêm giỏ và bấm yêu thích bao nhiêu lần (giờ Việt Nam, không tính bot). Chạm vào biểu đồ để xem từng giờ."
                  : "Mỗi ngày khách xem, thêm giỏ và bấm yêu thích bao nhiêu lần (không tính bot). Chạm vào biểu đồ để xem từng ngày."
              }
            >
              <ProductActivityChart points={report.productActivity} />
            </Card>

            <Card title="Từng sản phẩm" subtitle="Sản phẩm nào được xem nhiều, xem lâu, bỏ vào giỏ hay được yêu thích nhất — và sản phẩm nào chưa ai xem trong kỳ.">
              <ProductViews products={report.products} />
            </Card>

            <Card title="Sản phẩm bị bỏ giỏ" subtitle="Khách đã thêm vào giỏ nhưng không mua — xếp theo số lần bị bỏ nhiều nhất.">
              <AbandonedProducts products={report.products} />
            </Card>

            {report.isTruncated && (
              <p className="text-xs text-amber-700">Khoảng thời gian có hơn 20.000 phiên — số liệu chỉ tính trên 20.000 phiên đầu. Hãy chọn khoảng ngắn hơn.</p>
            )}
          </>
        )}

        <Card title="Tạo link gắn cho quảng cáo" subtitle="Dùng link này khi chạy ads để hệ thống biết khách đến từ quảng cáo nào.">
          <UtmLinkBuilder />
        </Card>
      </RangeFrame>
    </>
  );
};

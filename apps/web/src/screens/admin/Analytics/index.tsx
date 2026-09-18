import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatsSwitch } from "@/components/admin/StatsSwitch";
import { ANALYTICS_RANGES, readRange } from "@/helpers/analytics/ranges";
import { vietnamDaysBetween } from "@/helpers/analytics/product-activity";
import { judgeAdsTraffic } from "@/helpers/analytics/verdict";
import { getTrafficReport } from "@/server/analytics/report";
import { AbandonedProducts } from "./components/AbandonedProducts";
import { Card } from "./components/Card";
import { ProductViews } from "./components/ProductViews";
import { ProductActivityChart } from "./components/ProductActivityChart";
import { Funnel } from "./components/Funnel";
import { KpiTile } from "./components/KpiTile";
import { QualityBar } from "./components/QualityBar";
import { SetupNotice } from "./components/SetupNotice";
import { SourcesTable } from "./components/SourcesTable";
import { TrafficTimeChart, type TimeBucket } from "./components/TrafficTimeChart";
import { UtmLinkBuilder } from "./components/UtmLinkBuilder";
import { formatDuration, formatInt, formatPercent, formatVnd } from "./format";

export const dynamic = "force-dynamic";

const VERDICT_STYLE = {
  good: { box: "border-emerald-200 bg-emerald-50", icon: "✓", label: "Traffic quảng cáo tốt" },
  warning: { box: "border-amber-200 bg-amber-50", icon: "⚠", label: "Cần theo dõi" },
  critical: { box: "border-rose-200 bg-rose-50", icon: "⛔", label: "Nghi phân phối lỗi / click ảo" },
  insufficient: { box: "border-slate-200 bg-slate-50", icon: "ℹ", label: "Chưa đủ dữ liệu" },
} as const;

const AnalyticsPage = async ({ searchParams }: { searchParams: { range?: string } }) => {
  const rangeId = readRange(searchParams.range);
  const report = await getTrafficReport(rangeId);
  const { window, orders, previousOrders } = report;

  return (
    <>
    <div className="mb-6 lg:hidden">
      <StatsSwitch current="/admin/analytics" />
    </div>
    <div className="space-y-6">
      <PageHeader
        title="Thống kê truy cập"
        subtitle="Khách vào từ đâu, lúc nào, có mua không, và bao nhiêu lượt là click ảo. Cập nhật mỗi 5 phút."
      />

      <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Khoảng thời gian">
        {ANALYTICS_RANGES.map((range) => (
          <Link
            key={range.id}
            href={`/admin/analytics?range=${range.id}`}
            aria-current={range.id === rangeId ? "page" : undefined}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors sm:py-1.5 ${
              range.id === rangeId ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {range.label}
          </Link>
        ))}
      </nav>

      {report.status !== "ok" && <SetupNotice reason={report.status} message={report.status === "error" ? report.message : undefined} />}

      {report.status === "ok" && (
        <>
          {(() => {
            const verdict = judgeAdsTraffic(report.current.sources);
            const style = VERDICT_STYLE[verdict.level];
            return (
              <section className={`rounded-2xl border p-4 ${style.box}`}>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span aria-hidden="true">{style.icon}</span>
                  {style.label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{verdict.message}</p>
              </section>
            );
          })()}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Khách truy cập" value={formatInt(report.current.visitors)} current={report.current.visitors} previous={report.previous.visitors} kind="count" />
            <KpiTile label="Lượt truy cập (phiên)" value={formatInt(report.current.sessions)} current={report.current.sessions} previous={report.previous.sessions} kind="count" />
            <KpiTile label="Lượt xem trang" value={formatInt(report.current.pageViews)} current={report.current.pageViews} previous={report.previous.pageViews} kind="count" />
            <KpiTile
              label="Thời gian xem trung bình"
              value={formatDuration(report.current.avgDurationMs)}
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

          <div className="grid gap-6 lg:grid-cols-2">
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

      <Card title="Đơn hàng trong kỳ" subtitle="Lấy trực tiếp từ database — luôn đầy đủ, kể cả khi khách chặn theo dõi.">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile label="Đơn đã đặt" value={formatInt(orders.orders)} current={orders.orders} previous={previousOrders.orders} kind="count" />
          <KpiTile label="Người mua" value={formatInt(orders.buyers)} current={orders.buyers} previous={previousOrders.buyers} kind="count" />
          <KpiTile label="Sản phẩm đã bán" value={formatInt(orders.itemsSold)} current={orders.itemsSold} previous={previousOrders.itemsSold} kind="count" />
          <KpiTile label="Doanh thu (đơn đã xác nhận)" value={formatVnd(orders.revenue)} current={orders.revenue} previous={previousOrders.revenue} kind="count" />
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
          <KpiTile label="Đơn chuyển khoản" value={formatInt(orders.transferOrders)} current={orders.transferOrders} previous={previousOrders.transferOrders} kind="count" />
        </div>
      </Card>

      <Card title="Tạo link gắn cho quảng cáo" subtitle="Dùng link này khi chạy ads để hệ thống biết khách đến từ quảng cáo nào.">
        <UtmLinkBuilder />
      </Card>
    </div>
    </>
  );
};

export default AnalyticsPage;

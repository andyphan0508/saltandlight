import { readRange } from "@/helpers/analytics/ranges";
import { getTrafficReport } from "@/server/analytics/report";
import { AnalyticsView } from "./components/AnalyticsView";

export const dynamic = "force-dynamic";

const AnalyticsPage = async ({ searchParams }: { searchParams: { range?: string } }) => {
  const rangeId = readRange(searchParams.range);
  return <AnalyticsView report={await getTrafficReport(rangeId)} rangeId={rangeId} />;
};

export default AnalyticsPage;

import { TrackOrderView } from "@/screens/storefront/TrackOrder";

export const metadata = {
  title: "Tra cứu đơn hàng",
  description: "Kiểm tra tình trạng xử lý và vận chuyển đơn hàng của bạn.",
};

/** `?order=` comes from the button in the order email: the number is filled in, the customer adds their phone. */
const TrackOrderPage = ({ searchParams }: { searchParams: { order?: string } }) => {
  return <TrackOrderView initialOrderNumber={searchParams.order?.slice(0, 40) ?? ""} />;
};

export default TrackOrderPage;

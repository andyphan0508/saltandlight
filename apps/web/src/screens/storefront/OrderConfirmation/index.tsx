import { OrderConfirmationContent } from "./components/OrderConfirmationContent";

const OrderConfirmationPage = ({ params }: { params: { orderNumber: string } }) => (
  <OrderConfirmationContent orderNumber={params.orderNumber} />
);

export default OrderConfirmationPage;

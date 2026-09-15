import { CartView } from "@/components/cart/CartView";

export const metadata = {
  title: "Giỏ hàng",
  description: "Xem lại các sản phẩm trong giỏ hàng của bạn.",
};

const CartPage = () => {
  return <CartView />;
};

export default CartPage;

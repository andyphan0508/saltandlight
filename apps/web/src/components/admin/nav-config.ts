import {
  LayoutGrid,
  FolderTree,
  Package,
  ShoppingCart,
  Wallet,
  Users,
  UserCog,
  History,
  Sparkles,
  Tag,
  Globe,
  Mail,
  MessageSquare,
  BookOpen,
  TrendingUp,
} from "./Icons";

type NavIcon = (props: { size?: number | string; className?: string }) => JSX.Element;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** The whole admin menu — the desktop sidebar and the mobile "Thêm" sheet both render this. */
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
      { href: "/admin/analytics", label: "Thống kê truy cập", icon: TrendingUp },
      { href: "/admin/editor", label: "Editor", icon: Sparkles, badge: "Live" },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
      { href: "/admin/product-guides", label: "Hướng dẫn sản phẩm", icon: BookOpen },
      { href: "/admin/promotions", label: "Mã & Khuyến mãi", icon: Tag },
      { href: "/admin/banners", label: "Banner & Slider", icon: Sparkles },
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/payments", label: "Thanh toán", icon: Wallet },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { href: "/admin/contacts", label: "Yêu cầu liên hệ", icon: MessageSquare },
      { href: "/admin/customers", label: "Khách hàng", icon: Users },
      { href: "/admin/settings/payment", label: "Cài đặt thanh toán", icon: Wallet },
      { href: "/admin/settings/email", label: "Mẫu email đơn hàng", icon: Mail },
      { href: "/admin/settings/site", label: "Liên hệ, Header & Footer", icon: Globe },
    ],
  },
];

const OWNER_GROUP: NavGroup = {
  label: "Quản trị hệ thống",
  items: [
    { href: "/admin/users", label: "Nhân viên", icon: UserCog },
    { href: "/admin/audit-log", label: "Nhật ký hoạt động", icon: History },
  ],
};

export const navGroupsFor = (role: string) => (role === "owner" ? [...NAV_GROUPS, OWNER_GROUP] : NAV_GROUPS);

export const isNavActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");

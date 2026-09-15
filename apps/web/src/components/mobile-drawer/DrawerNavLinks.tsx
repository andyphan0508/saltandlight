import Link from "next/link";
import { isNavItemActive } from "@/helpers/nav";
import type { NavLinkItem } from "@/interfaces/site-settings";
import { ChevronRight } from "../Icons";

interface DrawerNavLinksProps {
  items: NavLinkItem[];
  pathname: string;
  onNavigate: () => void;
}

/** Full-width main navigation rows; the current section is filled. */
export const DrawerNavLinks = ({ items, pathname, onNavigate }: DrawerNavLinksProps) => (
  <div className="space-y-1">
    <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-ink/50">Điều hướng chính</div>
    {items.map((item) => {
      const isCurrent = isNavItemActive(pathname, item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all active-press ${
            isCurrent ? "bg-ink text-white shadow-sm" : "bg-white border border-ink/5 text-ink/80 hover:bg-ink/5 hover:text-ink"
          }`}
        >
          <span>{item.label}</span>
          <ChevronRight size={16} className={isCurrent ? "text-white" : "text-ink/30"} />
        </Link>
      );
    })}
  </div>
);

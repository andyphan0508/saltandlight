import Link from "next/link";
import { isNavItemActive } from "@/helpers/nav";
import type { NavLinkItem } from "@/interfaces/site-settings";

interface HeaderNavLinksProps {
  items: NavLinkItem[];
  pathname: string;
}

/** Desktop header pill links; the current section is filled. */
export const HeaderNavLinks = ({ items, pathname }: HeaderNavLinksProps) => (
  <>
    {items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={`rounded-full px-3 xl:px-4 py-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
          isNavItemActive(pathname, item.href) ? "bg-ink text-white shadow-sm" : "text-ink/85 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        {item.label}
      </Link>
    ))}
  </>
);

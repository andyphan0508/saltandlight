import Link from "next/link";
import { ChevronLeft } from "./Icons";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-ink"
    >
      <ChevronLeft size={14} /> {label}
    </Link>
  );
}

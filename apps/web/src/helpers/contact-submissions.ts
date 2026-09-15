import type { ContactFilters, ContactStatus } from "@/interfaces/contact";

export const CONTACT_STATUSES: { value: ContactStatus; label: string; badgeClass: string }[] = [
  { value: "new", label: "Chưa xử lý", badgeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "in_progress", label: "Đang xử lý", badgeClass: "bg-blue-50 text-blue-800 border-blue-200" },
  { value: "closed", label: "Đã hoàn tất", badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200" },
];

export const contactStatusOf = (status: string) =>
  CONTACT_STATUSES.find((s) => s.value === status) ?? CONTACT_STATUSES[0]!;

/** Admin contacts URL for the given filters; blank values and "all" are left out. */
export const contactsFilterHref = ({ q, status, type }: ContactFilters) => {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (status && status !== "all") params.set("status", status);
  if (type && type !== "all") params.set("type", type);
  const query = params.toString();
  return `/admin/contacts${query ? `?${query}` : ""}`;
};

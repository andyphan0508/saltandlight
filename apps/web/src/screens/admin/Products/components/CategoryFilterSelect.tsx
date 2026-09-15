"use client";

/**
 * A native <select> with an onChange handler can't be attached from a
 * Server Component (products/page.tsx has no "use client") — React throws
 * "Event handlers cannot be passed to Client Component props" since a live
 * function reference isn't serializable across the RSC boundary. Pulled out
 * into its own small Client Component, same pattern as FeaturedToggle.tsx.
 */
export function CategoryFilterSelect({
  categoryId,
  categories,
}: {
  categoryId?: string;
  categories: { id: string; name: string }[];
}) {
  return (
    <select
      name="category"
      defaultValue={categoryId || ""}
      onChange={(e) => {
        e.currentTarget.form?.submit();
      }}
      className="rounded-full border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-xs font-semibold text-slate-700 focus:border-brand-forest focus:outline-none"
    >
      <option value="">Tất cả danh mục</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

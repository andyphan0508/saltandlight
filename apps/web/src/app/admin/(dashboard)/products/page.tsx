import Link from "next/link";
import Image from "next/image";
import { prisma } from "@saltandlight/db";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Plus, Search, ImageOff } from "@/components/admin/Icons";
import { FeaturedToggle } from "@/components/admin/FeaturedToggle";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Bản nháp", className: "bg-slate-100 text-slate-600 border-slate-200" },
  published: { label: "Đang bán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  archived: { label: "Lưu trữ", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const where: any = {
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        status: true,
        isFeatured: true,
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        variants: { select: { price: true, compareAtPrice: true, stockQuantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${total} sản phẩm trong hệ thống kho hàng`}
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-forest px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={15} />
            <span>Thêm sản phẩm mới</span>
          </Link>
        }
      />

      <div className="luno-card">
        {/* Search & Status Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative w-full sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm theo tên sản phẩm…"
              className="w-full rounded-full border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs font-medium text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none transition-all"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <StatusPill href="/admin/products" active={!status} label="Tất cả sản phẩm" />
            {Object.entries(STATUS_LABEL).map(([key, meta]) => (
              <StatusPill
                key={key}
                href={`/admin/products?status=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                active={status === key}
                label={meta.label}
              />
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Sản phẩm</th>
                <th className="px-5 py-3.5">Danh mục</th>
                <th className="px-5 py-3.5">Giá bán</th>
                <th className="px-5 py-3.5">Tồn kho</th>
                <th className="px-5 py-3.5 text-center">Nổi bật</th>
                <th className="px-5 py-3.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const prices = p.variants.map((v) => Number(v.price));
                const compareAts = p.variants
                  .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice) : null))
                  .filter((v): v is number => v != null);
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxCompareAt = compareAts.length ? Math.max(...compareAts) : null;
                const discount = calcDiscountPercent(minPrice, maxCompareAt);
                const stock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const statusMeta = STATUS_LABEL[p.status] ?? {
                  label: p.status,
                  className: "bg-slate-100 text-slate-600 border-slate-200",
                };

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <ImageOff size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-900 group-hover:text-brand-forest transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.variants.length} phân loại biến thể
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-brand-forest text-sm">
                        {formatVND(minPrice)}
                      </div>
                      {discount && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 line-through">
                            {formatVND(maxCompareAt!)}
                          </span>
                          <span className="font-bold text-rose-600">-{discount}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          stock <= 5
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {stock} cái
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex justify-center">
                        <FeaturedToggle productId={p.id} initialFeatured={p.isFeatured} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            basePath="/admin/products"
            searchParams={{ q, status }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
        active
          ? "bg-ink text-white shadow-sm"
          : "border border-slate-200/80 bg-white text-slate-600 hover:border-brand-forest hover:text-brand-forest hover:bg-mint-50/30"
      }`}
    >
      {label}
    </Link>
  );
}

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@saltandlight/db";
import { Button } from "@saltandlight/ui";
import { formatVND, calcDiscountPercent } from "@saltandlight/domain";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { Plus, Search, ImageOff } from "@/components/Icons";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Nháp", className: "bg-ink/8 text-ink/60" },
  published: { label: "Đang bán", className: "bg-mint-100 text-brand-forest" },
  archived: { label: "Lưu trữ", className: "bg-gold-100 text-gold-600" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        subtitle={`${total} sản phẩm trong kho hàng`}
        action={
          <Link href="/products/new">
            <Button size="sm">
              <Plus size={15} /> Thêm sản phẩm
            </Button>
          </Link>
        }
      />

      <div className="rounded-2xl border border-ink/10 bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm theo tên sản phẩm…"
              className="w-full rounded-xl border border-ink/15 py-2 pl-9 pr-3 text-sm focus:border-brand-forest focus:outline-none"
            />
          </form>
          <div className="flex flex-wrap gap-1.5">
            <StatusPill href="/products" active={!status} label="Tất cả" />
            {Object.entries(STATUS_LABEL).map(([key, meta]) => (
              <StatusPill
                key={key}
                href={`/products?status=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                active={status === key}
                label={meta.label}
              />
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">Giá</th>
                <th className="px-5 py-3 font-semibold">Tồn kho</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.map((p) => {
                const prices = p.variants.map((v) => Number(v.price));
                const compareAts = p.variants
                  .map((v) => (v.compareAtPrice ? Number(v.compareAtPrice) : null))
                  .filter((v): v is number => v != null);
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxCompareAt = compareAts.length ? Math.max(...compareAts) : null;
                const discount = calcDiscountPercent(minPrice, maxCompareAt);
                const stock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const statusMeta = STATUS_LABEL[p.status] ?? { label: p.status, className: "bg-ink/8" };

                return (
                  <tr key={p.id} className="hover:bg-mint-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-mint-100">
                          {p.images[0] ? (
                            <Image src={p.images[0].url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-ink/25">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink hover:underline">{p.name}</div>
                          <div className="text-xs text-ink/40">{p.variants.length} biến thể</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink/60">{p.category?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-ink">{formatVND(minPrice)}</div>
                      {discount && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-ink/35 line-through">{formatVND(maxCompareAt!)}</span>
                          <span className="font-bold text-sale">-{discount}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={stock <= 5 ? "font-semibold text-sale" : "text-ink/70"}>{stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-ink/40">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          basePath="/products"
          searchParams={{ q, status }}
        />
      </div>
    </div>
  );
}

function StatusPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-ink text-white" : "border border-ink/15 text-ink/60 hover:border-ink/40"
      }`}
    >
      {label}
    </Link>
  );
}

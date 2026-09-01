import Link from "next/link";
import Image from "next/image";
import { prisma } from "@saltandlight/db";
import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black uppercase">Sản phẩm</h1>
        <Link href="/products/new">
          <Button size="sm">+ Thêm sản phẩm</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Tên sản phẩm</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
              const minPrice = Math.min(...p.variants.map((v) => Number(v.price)), 0);
              return (
                <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-mint-50">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-mint-100">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt="" fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{formatVND(minPrice)}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-pill bg-mint-100 px-2.5 py-1 text-xs font-semibold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

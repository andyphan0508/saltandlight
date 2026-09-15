const RANK_CLASSES = [
  "bg-amber-100 text-amber-700 border border-amber-200",
  "bg-slate-200 text-slate-700",
  "bg-orange-100 text-orange-700",
];

const OTHER_RANK_CLASS = "bg-slate-100 text-slate-500";

/** Best sellers with a gold / silver / bronze rank badge for the top three. */
export const TopProductsList = ({ products }: { products: { name: string; quantity: number }[] }) => (
  <div className="space-y-3">
    {products.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Chưa có dữ liệu sản phẩm.</p>}
    {products.map((product, i) => (
      <div key={product.name} className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-slate-50 transition-colors">
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${RANK_CLASSES[i] ?? OTHER_RANK_CLASS}`}
        >
          #{i + 1}
        </span>
        <div className="min-w-0 flex-1">
          <span className="truncate text-xs font-bold text-slate-800 block">{product.name}</span>
          <span className="text-[11px] text-slate-400">Thời trang Cơ Đốc</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
          {product.quantity} đã bán
        </span>
      </div>
    ))}
  </div>
);

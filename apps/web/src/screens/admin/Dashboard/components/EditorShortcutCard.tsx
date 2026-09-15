import Link from "next/link";
import { ArrowRight, Sparkles } from "@/components/admin/Icons";
import { MANAGED_PAGES } from "@/helpers/managed-pages";

/** Promotes the Live Editor with quick links to each editable page. */
export const EditorShortcutCard = () => (
  <div className="relative overflow-hidden rounded-3xl border border-brand-forest/25 bg-gradient-to-br from-white via-mint-50/40 to-emerald-50/60 p-6 sm:p-8 shadow-xs">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="space-y-2.5 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest text-white px-3 py-0.5 text-[11px] font-bold shadow-xs">
            <Sparkles size={12} />
            <span>Editor</span>
          </span>
          <span className="text-[11px] font-bold text-brand-forest bg-mint-100 px-2.5 py-0.5 rounded-md">Chuẩn Elementor WYSIWYG</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Trình Dựng Trang Trực Quan (Live Elementor Editor)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Chỉnh sửa trực tiếp trên giao diện trang web thật của bạn. Click vào bất kỳ khối nào trên trang để sửa nội dung tức thì,
          kéo-thả sắp xếp khối, và xem trước linh hoạt trên cả Máy tính, Máy tính bảng và Điện thoại.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          <span className="text-xs font-semibold text-slate-500">Mở nhanh trang:</span>
          {MANAGED_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/admin/editor?page=${page.slug}`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand-forest hover:text-brand-forest hover:bg-mint-50 transition-all shadow-2xs"
            >
              {page.label} ({page.path})
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
        <Link
          href="/admin/editor"
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-brand-forest px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-forest/90 transition-all shadow-md shadow-brand-forest/20 active:scale-95"
        >
          <Sparkles size={16} />
          <span>Mở Elementor Editor ngay</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </div>
);

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  FileText,
  Heading,
  ImagePlus,
  List,
  Pencil,
  Quote,
  Trash2,
} from "./Icons";
import type { EditableBlockType, ProductContentBlock } from "@/helpers/product-content";
import { ProductContentRenderer } from "@/components/ProductContentRenderer";
import { ProductBlockFields } from "./ProductBlockFields";

type IconComponent = (props: { size?: number | string; className?: string }) => JSX.Element;

const PALETTE: { type: EditableBlockType; label: string; icon: IconComponent }[] = [
  { type: "paragraph", label: "Đoạn văn", icon: FileText },
  { type: "heading", label: "Tiêu đề mục", icon: Heading },
  { type: "bullet_list", label: "Gạch đầu dòng", icon: List },
  { type: "quote", label: "Trích dẫn Lời Chúa", icon: Quote },
  { type: "image", label: "Ảnh minh họa", icon: ImagePlus },
];

function newBlock(type: EditableBlockType): ProductContentBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "paragraph":
      return { id, type, content: "" };
    case "heading":
      return { id, type, level: 2, text: "" };
    case "bullet_list":
      return { id, type, items: [""] };
    case "quote":
      return { id, type, quote: "", quoteRef: "" };
    case "image":
      return { id, type, url: "", caption: "" };
  }
}

/**
 * Editor for a product's own description blocks. Content shared by a whole
 * category (care guides, size charts, highlights) is managed in /admin/product-guides.
 */
export function ProductContentEditor({
  blocks,
  onChange,
}: {
  blocks: ProductContentBlock[];
  onChange: (blocks: ProductContentBlock[]) => void;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  function update(id: string, patch: Partial<ProductContentBlock>) {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ProductContentBlock) : b)));
  }

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function duplicate(index: number) {
    const next = [...blocks];
    next.splice(index + 1, 0, { ...structuredClone(blocks[index]!), id: crypto.randomUUID() });
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-ink/15 bg-slate-50/50 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">Mô tả chi tiết sản phẩm</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Chỉ nhập nội dung riêng của sản phẩm này. Hướng dẫn bảo quản, bảng size, điểm nổi bật dùng chung được quản
            lý theo danh mục tại{" "}
            <Link href="/admin/product-guides" className="font-bold text-brand-forest hover:underline">
              Hướng dẫn sản phẩm
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
            <Pencil size={13} /> Soạn thảo ({blocks.length})
          </TabButton>
          <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
            <Eye size={13} /> Xem trước
          </TabButton>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs">
          {blocks.length > 0 ? (
            <ProductContentRenderer blocks={blocks} />
          ) : (
            <p className="text-center text-xs text-slate-400">Chưa có nội dung.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-brand-forest/50 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-mint-100 text-brand-forest text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {PALETTE.find((p) => p.type === block.type)?.label ?? block.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton title="Di chuyển lên" disabled={idx === 0} onClick={() => move(idx, -1)}>
                    <ChevronUp size={15} />
                  </IconButton>
                  <IconButton title="Di chuyển xuống" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)}>
                    <ChevronDown size={15} />
                  </IconButton>
                  <IconButton title="Nhân bản" onClick={() => duplicate(idx)}>
                    <Copy size={14} />
                  </IconButton>
                  <IconButton title="Xóa khối" danger onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
              <ProductBlockFields block={block} onChange={(patch) => update(block.id, patch)} />
            </div>
          ))}

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-3.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              + Thêm khối nội dung:
            </span>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange([...blocks, newBlock(type)])}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-forest hover:bg-mint-50 hover:text-brand-forest transition-all shadow-2xs"
                >
                  <Icon size={14} className="text-slate-400 group-hover:text-brand-forest transition-colors" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
        active ? "bg-brand-forest text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  title,
  disabled,
  danger,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1 rounded-lg text-slate-400 disabled:opacity-30 ${
        danger ? "hover:text-rose-600 hover:bg-rose-50" : "hover:text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

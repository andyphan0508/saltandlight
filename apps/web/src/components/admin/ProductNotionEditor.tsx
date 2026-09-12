"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@saltandlight/ui";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
  Heart,
  Truck,
  ShieldCheck,
  Star,
  Eye,
  Pencil,
  ImagePlus,
  FileText,
  Heading,
  List,
  Lightbulb,
  Quote,
  Table,
  CrossIcon,
  Gift,
} from "./Icons";
import {
  parseProductContent,
  serializeProductContent,
  getDefaultProductSections,
  type ProductContentBlock,
} from "@/lib/product-content";
import { ProductContentRenderer } from "@/components/ProductContentRenderer";

export function ProductNotionEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [blocks, setBlocks] = useState<ProductContentBlock[]>(() => parseProductContent(value));
  const [activeTab, setActiveTab] = useState<"blocks" | "preview" | "raw">("blocks");
  const [rawText, setRawText] = useState(value);
  const lastSerializedRef = useRef(value);

  // Sync back if external value changes (e.g. form loaded, reset or async fetched)
  useEffect(() => {
    if (value !== lastSerializedRef.current) {
      lastSerializedRef.current = value;
      setBlocks(parseProductContent(value));
      setRawText(value);
    }
  }, [value]);

  // Sync back to parent when blocks change
  function updateBlocks(newBlocks: ProductContentBlock[]) {
    setBlocks(newBlocks);
    const serialized = serializeProductContent(newBlocks);
    lastSerializedRef.current = serialized;
    setRawText(serialized);
    onChange(serialized);
  }

  // Add a new block at the end or specific index
  function addBlock(type: ProductContentBlock["type"], atIndex?: number) {
    const newId = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let block: ProductContentBlock;

    switch (type) {
      case "paragraph":
        block = { id: newId, type: "paragraph", content: "" };
        break;
      case "heading":
        block = { id: newId, type: "heading", level: 2, text: "" };
        break;
      case "bullet_list":
        block = { id: newId, type: "bullet_list", items: [""] };
        break;
      case "callout":
        block = {
          id: newId,
          type: "callout",
          icon: "Sparkles",
          title: "Mẹo phối đồ & Bảo quản",
          body: "",
          variant: "mint",
        };
        break;
      case "quote":
        block = {
          id: newId,
          type: "quote",
          quote: "Ngươi là muối của đất và ánh sáng của thế gian.",
          quoteRef: "Ma-thi-ơ 5:13-14",
        };
        break;
      case "specs_table":
        block = {
          id: newId,
          type: "specs_table",
          rows: [
            { label: "Chất liệu", value: "Cotton 100% 2 chiều" },
            { label: "Độ dày", value: "250 GSM dệt dầy dặn" },
            { label: "Form dáng", value: "Regular Fit Unisex" },
          ],
        };
        break;
      case "image":
        block = { id: newId, type: "image", url: "", caption: "" };
        break;
      case "price_note":
        block = { id: newId, type: "price_note", text: "" };
        break;
    }

    const next = [...blocks];
    if (typeof atIndex === "number") {
      next.splice(atIndex + 1, 0, block);
    } else {
      next.push(block);
    }
    updateBlocks(next);
  }

  function modifyBlock(id: string, patch: Partial<ProductContentBlock>) {
    const next = blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ProductContentBlock) : b));
    updateBlocks(next);
  }

  function removeBlock(id: string) {
    const next = blocks.filter((b) => b.id !== id);
    updateBlocks(next);
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const next = [...blocks];
    const moved = next.splice(index, 1)[0];
    if (moved) {
      next.splice(targetIndex, 0, moved);
      updateBlocks(next);
    }
  }

  function duplicateBlock(index: number) {
    const item = blocks[index];
    if (!item) return;
    const cloned: ProductContentBlock = {
      ...JSON.parse(JSON.stringify(item)),
      id: `blk-${Date.now()}`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, cloned);
    updateBlocks(next);
  }

  function handleRawChange(text: string) {
    setRawText(text);
    onChange(text);
    setBlocks(parseProductContent(text));
  }

  return (
    <div className="rounded-2xl border border-ink/15 bg-slate-50/50 p-4 sm:p-5 space-y-4">
      {/* Header with Mode Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Nội dung chi tiết sản phẩm (Dạng khối Notion)
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dễ dàng chèn đoạn văn, tiêu đề, danh sách, khung ghi chú, trích dẫn Kinh Thánh và bảng thông số.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("blocks")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "blocks"
                ? "bg-brand-forest text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Pencil size={13} />
            <span>Soạn thảo khối ({blocks.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-brand-forest text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Eye size={13} />
            <span>Xem trước</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("raw")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "raw"
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Văn bản thô
          </button>
        </div>
      </div>

      {/* Tab 1: Blocks Editor */}
      {activeTab === "blocks" && (
        <div className="space-y-3.5">
          {blocks.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-white border border-dashed border-slate-300 space-y-3">
              <Sparkles size={28} className="mx-auto text-slate-300" />
              <div>
                <p className="text-xs font-bold text-slate-700">Chưa có khối nội dung nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bấm nạp mẫu mặc định bên dưới hoặc chọn từng khối để tự tạo nội dung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateBlocks(getDefaultProductSections())}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-forest text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-brand-forest/90 transition-all"
              >
                <Sparkles size={14} />
                <span>Nạp trọn bộ nội dung mặc định của sản phẩm</span>
              </button>
            </div>
          ) : (
            blocks.map((block, idx) => (
              <div
                key={block.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-brand-forest/50 transition-all"
              >
                {/* Block Header Toolbar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-mint-100 text-brand-forest text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {getBlockTypeName(block.type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBlock(idx, "up")}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      title="Di chuyển lên trên"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => moveBlock(idx, "down")}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                      title="Di chuyển xuống dưới"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Nhân bản khối này"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Xóa khối này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Block Body Content */}
                <BlockFieldEditor block={block} onChange={(patch) => modifyBlock(block.id, patch)} />
              </div>
            ))
          )}

          {/* Quick Add Palette Toolbar */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-3.5 space-y-3">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                + Thêm khối nội dung mới:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: "paragraph", label: "Đoạn văn", icon: FileText },
                  { type: "heading", label: "Tiêu đề mục", icon: Heading },
                  { type: "bullet_list", label: "Gạch đầu dòng", icon: List },
                  { type: "callout", label: "Khung chú thích", icon: Lightbulb },
                  { type: "quote", label: "Trích dẫn Lời Chúa", icon: Quote },
                  { type: "specs_table", label: "Bảng thông số", icon: Table },
                  { type: "image", label: "Ảnh minh họa", icon: ImagePlus },
                ].map((btn) => {
                  const IconComp = btn.icon;
                  return (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => addBlock(btn.type as ProductContentBlock["type"])}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-forest hover:bg-mint-50 hover:text-brand-forest transition-all shadow-2xs text-left group"
                    >
                      <IconComp size={14} className="text-slate-400 group-hover:text-brand-forest transition-colors" />
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Template Presets */}
            <div className="border-t border-slate-200/80 pt-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                ⚡ Nạp nhanh mẫu có sẵn:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateBlocks([...blocks, ...getDefaultProductSections()]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-forest/30 bg-mint-100/90 px-3 py-1.5 text-[11px] font-bold text-brand-forest hover:bg-mint-200 transition-colors shadow-2xs"
                >
                  <Sparkles size={13} />
                  <span>⚡ Nạp trọn bộ nội dung mặc định (Điểm nổi bật + Bảng size + Giặt phơi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    const newBlocks: ProductContentBlock[] = [
                      { id: `blk-${ts}-1`, type: "heading", level: 2, text: "Điểm Nổi Bật Của Sản Phẩm" },
                      {
                        id: `blk-${ts}-2`,
                        type: "bullet_list",
                        items: [
                          "Chất liệu 100% Cotton 4 chiều, thấm hút mồ hôi tối đa, thoáng mát.",
                          "Công nghệ in DTG cao cấp, không nứt gãy hoặc phai màu sau khi giặt.",
                          "Form dáng Regular Fit chuẩn Unisex, dễ dàng phối đồ đi học, đi làm, đi nhóm.",
                          "Đóng gói chỉn chu kèm bookmark Lời Chúa và thiệp cảm ơn.",
                        ],
                      },
                    ];
                    updateBlocks([...blocks, ...newBlocks]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-forest/20 bg-mint-50/70 px-2.5 py-1.5 text-[11px] font-bold text-brand-forest hover:bg-mint-100 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>+ Mẫu Điểm nổi bật</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    const newBlocks: ProductContentBlock[] = [
                      { id: `blk-${ts}-1`, type: "heading", level: 2, text: "Hướng Dẫn Bảo Quản Áo" },
                      {
                        id: `blk-${ts}-2`,
                        type: "callout",
                        icon: "🧼",
                        title: "Giặt áo",
                        body: "Nên lộn trái áo khi giặt, không ngâm lâu trong chất tẩy mạnh.",
                        variant: "mint",
                      },
                      {
                        id: `blk-${ts}-3`,
                        type: "callout",
                        icon: "👔",
                        title: "Phơi & Ủi",
                        body: "Phơi trong bóng râm mát. Không ủi trực tiếp lên hình in.",
                        variant: "blue",
                      },
                    ];
                    updateBlocks([...blocks, ...newBlocks]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-forest/20 bg-mint-50/70 px-2.5 py-1.5 text-[11px] font-bold text-brand-forest hover:bg-mint-100 transition-colors"
                >
                  <span>🧼 + Mẫu Hướng dẫn giặt &amp; phơi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ts = Date.now();
                    const newBlocks: ProductContentBlock[] = [
                      { id: `blk-${ts}-1`, type: "heading", level: 2, text: "Bảng Quy Đổi Size Áo" },
                      {
                        id: `blk-${ts}-2`,
                        type: "specs_table",
                        rows: [
                          { label: "Size S", value: "1m50 - 1m62 | 42 - 52 kg (Dài 66cm / Rộng 48cm)" },
                          { label: "Size M", value: "1m60 - 1m70 | 53 - 62 kg (Dài 69cm / Rộng 51cm)" },
                          { label: "Size L", value: "1m68 - 1m76 | 63 - 72 kg (Dài 72cm / Rộng 54cm)" },
                          { label: "Size XL", value: "1m75 - 1m85 | 73 - 85 kg (Dài 75cm / Rộng 57cm)" },
                        ],
                      },
                    ];
                    updateBlocks([...blocks, ...newBlocks]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-forest/20 bg-mint-50/70 px-2.5 py-1.5 text-[11px] font-bold text-brand-forest hover:bg-mint-100 transition-colors"
                >
                  <span>📏 + Mẫu Bảng size áo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Preview */}
      {activeTab === "preview" && (
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="border-b border-ink/10 pb-3 mb-4 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink/70">
              Xem trước giao diện trên trang sản phẩm
            </h4>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Trực quan (WYSIWYG)
            </span>
          </div>
          <ProductContentRenderer content={serializeProductContent(blocks)} />
        </div>
      )}

      {/* Tab 3: Raw text fallback */}
      {activeTab === "raw" && (
        <div className="space-y-2">
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => handleRawChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono bg-white focus:border-brand-forest focus:outline-none"
            placeholder="Dán hoặc chỉnh sửa chuỗi JSON / văn bản thuần..."
          />
          <p className="text-[11px] text-slate-400">
            Dành cho nhà phát triển hoặc khi muốn sao chép nhanh giữa các sản phẩm.
          </p>
        </div>
      )}
    </div>
  );
}

function getBlockTypeName(type: ProductContentBlock["type"]) {
  switch (type) {
    case "paragraph":
      return "Đoạn văn bản";
    case "heading":
      return "Tiêu đề mục";
    case "bullet_list":
      return "Danh sách gạch đầu dòng";
    case "callout":
      return "Khung ghi chú nổi bật";
    case "quote":
      return "Câu Lời Chúa / Trích dẫn";
    case "specs_table":
      return "Bảng thông số kỹ thuật";
    case "image":
      return "Hình ảnh chi tiết";
    case "price_note":
      return "Thông điệp ưu đãi khung giá";
  }
}

function BlockFieldEditor({
  block,
  onChange,
}: {
  block: ProductContentBlock;
  onChange: (patch: any) => void;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <textarea
          rows={3}
          value={block.content || ""}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Nhập nội dung đoạn văn mô tả..."
          className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-brand-forest focus:outline-none resize-y"
        />
      );

    case "heading":
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={block.level || 2}
            onChange={(e) => onChange({ level: Number(e.target.value) })}
            className="w-36 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none"
          >
            <option value={2}>Tiêu đề lớn (H2)</option>
            <option value={3}>Tiêu đề nhỏ (H3)</option>
          </select>
          <input
            type="text"
            value={block.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Nhập tiêu đề mục (VD: Ý nghĩa thiết kế, Chất liệu cao cấp...)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-brand-forest focus:outline-none"
          />
        </div>
      );

    case "bullet_list": {
      const items = block.items || [""];
      function updateItem(idx: number, val: string) {
        const next = [...items];
        next[idx] = val;
        onChange({ items: next });
      }
      function removeItem(idx: number) {
        const next = items.filter((_, i) => i !== idx);
        onChange({ items: next.length ? next : [""] });
      }
      function addItem() {
        onChange({ items: [...items, ""] });
      }

      return (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-forest flex-shrink-0" />
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder={`Ý gạch đầu dòng thứ ${idx + 1}...`}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs sm:text-sm focus:border-brand-forest focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline pt-1"
          >
            <Plus size={13} /> Thêm dòng
          </button>
        </div>
      );
    }

    case "callout":
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Biểu tượng</label>
              <select
                value={block.icon || "Sparkles"}
                onChange={(e) => onChange({ icon: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="Sparkles">Sparkles (Lấp lánh)</option>
                <option value="Heart">Heart (Trái tim)</option>
                <option value="Gift">Gift (Quà tặng)</option>
                <option value="Truck">Truck (Giao hàng)</option>
                <option value="ShieldCheck">ShieldCheck (Bảo hành)</option>
                <option value="Star">Star (Ngôi sao)</option>
                <option value="CrossIcon">Cross (Thánh giá)</option>
                <option value="🧼">🧼 Giặt áo / Vệ sinh</option>
                <option value="👔">👔 Phơi &amp; Ủi / Form dáng</option>
                <option value="💡">💡 Mẹo hay / Lưu ý</option>
                <option value="🌿">🌿 Chất liệu tự nhiên</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tông màu khung</label>
              <select
                value={block.variant || "mint"}
                onChange={(e) => onChange({ variant: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="mint">Xanh Mint (Thanh lịch)</option>
                <option value="amber">Vàng Nắng (Ấm áp)</option>
                <option value="blue">Xanh Dương (Tin cậy)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tiêu đề khung</label>
              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="VD: Mẹo bảo quản form áo"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold focus:border-brand-forest focus:outline-none"
              />
            </div>
          </div>
          <textarea
            rows={2}
            value={block.body || ""}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="Nội dung ghi chú chi tiết..."
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-brand-forest focus:outline-none"
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={block.quote || ""}
            onChange={(e) => onChange({ quote: e.target.value })}
            placeholder="Nhập câu Kinh Thánh hoặc trích dẫn ý nghĩa..."
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm font-serif italic text-slate-800 focus:border-brand-forest focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex-shrink-0">Nguồn trích:</span>
            <input
              type="text"
              value={block.quoteRef || ""}
              onChange={(e) => onChange({ quoteRef: e.target.value })}
              placeholder="VD: Ma-thi-ơ 5:13-14 hoặc Tên sách/Tác giả"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none font-semibold text-brand-forest"
            />
          </div>
        </div>
      );

    case "specs_table": {
      const rows = block.rows || [];
      function updateRow(idx: number, patch: { label?: string; value?: string }) {
        const next = [...rows];
        const current = next[idx] || { label: "", value: "" };
        next[idx] = {
          label: patch.label !== undefined ? patch.label : current.label,
          value: patch.value !== undefined ? patch.value : current.value,
        };
        onChange({ rows: next });
      }
      function removeRow(idx: number) {
        const next = rows.filter((_, i) => i !== idx);
        onChange({ rows: next });
      }
      function addRow() {
        onChange({ rows: [...rows, { label: "", value: "" }] });
      }

      return (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {rows.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={r.label}
                  onChange={(e) => updateRow(idx, { label: e.target.value })}
                  placeholder="Tên thông số (VD: Chất liệu)"
                  className="w-1/3 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                />
                <input
                  type="text"
                  value={r.value}
                  onChange={(e) => updateRow(idx, { value: e.target.value })}
                  placeholder="Giá trị (VD: Cotton 100% 2 chiều)"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline pt-1"
          >
            <Plus size={13} /> Thêm dòng thông số
          </button>
        </div>
      );
    }

    case "image":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Đường dẫn ảnh (URL)
              </label>
              <input
                type="text"
                value={block.url || ""}
                onChange={(e) => onChange({ url: e.target.value })}
                placeholder="https://... hoặc đường dẫn ảnh"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-brand-forest focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Chú thích ảnh (Không bắt buộc)
              </label>
              <input
                type="text"
                value={block.caption || ""}
                onChange={(e) => onChange({ caption: e.target.value })}
                placeholder="VD: Chi tiết đường may cổ áo dệt bo gân"
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-brand-forest focus:outline-none"
              />
            </div>
          </div>
          {block.url && (
            <div className="relative h-36 w-full max-w-sm rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={block.url} alt={block.caption || "Ảnh"} fill className="object-cover" />
            </div>
          )}
        </div>
      );

    case "price_note":
      return (
        <div className="rounded-2xl border border-mint-200/80 bg-mint-50/60 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-forest">
            <Sparkles size={15} className="text-amber-500" />
            <span>Thông điệp ưu đãi hiển thị trong khung giá sản phẩm</span>
          </div>
          <input
            type="text"
            value={block.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="VD: Tặng kèm thiệp Lời Chúa & Miễn phí vận chuyển cho đơn từ 299K"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-brand-forest focus:outline-none"
          />
        </div>
      );
  }
}

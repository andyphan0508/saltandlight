"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { X } from "@/components/admin/Icons";
import { defaultContent, sanitizeBlockContent, validateBlockContent } from "@/helpers/page-block-content";
import { BLOCK_TYPE_LABELS, type PageBlockItem, type PageBlockTypeValue } from "@/interfaces/page-block";
import { ContentFields } from "./block-fields/ContentFields";

interface BlockEditFormProps {
  page: string;
  block: PageBlockItem | null;
  defaultType: PageBlockTypeValue;
  onClose: () => void;
  onSaved: (block: PageBlockItem) => void;
  onChangePreview?: (content: Record<string, any>) => void;
}

/** Live Editor sidebar form: edits one block, streams changes to the preview iframe and saves through the API. */
export const BlockEditForm = ({ page, block, defaultType, onClose, onSaved, onChangePreview }: BlockEditFormProps) => {
  const type = block?.type ?? defaultType;
  const [content, setContent] = useState<Record<string, any>>(block?.content ?? defaultContent(type));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPatch = (patch: Record<string, any>) => {
    setContent((prev) => {
      const next = { ...prev, ...patch };
      onChangePreview?.(next);
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitized = sanitizeBlockContent(type, content);
    const validationError = validateBlockContent(type, sanitized);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const url = block ? `/api/admin/page-blocks/${block.id}` : "/api/admin/page-blocks";
      const method = block ? "PATCH" : "POST";
      const body = block ? { content: sanitized } : { page, type, content: sanitized };
      const data = await adminFetch<{ block: PageBlockItem }>(url, { method, body });
      onSaved(data.block);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest">Chỉnh sửa khối</span>
          <h3 className="font-bold text-slate-900 text-xs truncate">{BLOCK_TYPE_LABELS[type]}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          title="Đóng bảng chỉnh sửa"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
        )}

        <ContentFields type={type} content={content} onPatch={onPatch} />

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-3 py-1.5 text-xs font-semibold">
            Quay lại
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl px-4 py-1.5 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
          >
            {isSaving ? "Đang lưu..." : block ? "Lưu khối" : "Tạo khối"}
          </Button>
        </div>
      </form>
    </div>
  );
};

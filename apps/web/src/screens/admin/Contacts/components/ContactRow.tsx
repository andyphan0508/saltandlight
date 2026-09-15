"use client";

import { ExternalLink, Mail, MessageSquare, Phone, Tag, Trash2 } from "@/components/admin/Icons";
import { CONTACT_STATUSES, contactStatusOf } from "@/helpers/contact-submissions";
import { normalizeVietnamesePhone } from "@/helpers/phone";
import type { ContactStatus, ContactSubmissionItem } from "@/interfaces/contact";

interface ContactRowProps {
  contact: ContactSubmissionItem;
  onOpen: () => void;
  onStatusChange: (status: ContactStatus) => void;
  onDelete: () => void;
}

const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** One submission: customer, quick call/Zalo/email links, request type, message excerpt, status and actions. */
export const ContactRow = ({ contact, onOpen, onStatusChange, onDelete }: ContactRowProps) => {
  const phone = normalizeVietnamesePhone(contact.phone);

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="py-4 pl-6 pr-4">
        <div className="font-bold text-slate-900">{contact.fullName}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(contact.createdAt)}</div>
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {phone ? (
            <>
              <a
                href={`tel:${phone}`}
                title={`Gọi ngay ${contact.phone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Phone size={12} />
                <span>{contact.phone}</span>
              </a>
              <a
                href={`https://zalo.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Nhắn tin Zalo"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <span>Zalo</span>
                <ExternalLink size={11} />
              </a>
            </>
          ) : (
            <span className="text-slate-400 italic text-xs">Không có SĐT</span>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              title={`Gửi email: ${contact.email}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Mail size={12} />
              <span className="max-w-[120px] truncate">{contact.email}</span>
            </a>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        {contact.type === "custom_order" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200/60">
            <Tag size={11} />
            <span>Đặt theo yêu cầu</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-bold text-brand-forest">
            <span>Tư vấn chung</span>
          </span>
        )}
      </td>

      <td className="py-4 px-4 max-w-xs">
        <p
          className="line-clamp-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
          onClick={onOpen}
          title="Bấm để xem đầy đủ nội dung"
        >
          {contact.message}
        </p>
      </td>

      <td className="py-4 px-4">
        <select
          value={contact.status}
          onChange={(e) => onStatusChange(e.target.value as ContactStatus)}
          className={`rounded-full border px-2.5 py-1 text-xs font-bold focus:outline-none transition-all ${contactStatusOf(contact.status).badgeClass}`}
        >
          {CONTACT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </td>

      <td className="py-4 pr-6 pl-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onOpen}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-forest hover:bg-mint-50 transition-colors"
          >
            <MessageSquare size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Xóa yêu cầu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

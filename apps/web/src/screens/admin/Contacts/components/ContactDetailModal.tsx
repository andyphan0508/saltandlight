"use client";

import { Modal } from "@/components/Modal";
import { ExternalLink, Mail, Phone, X } from "@/components/admin/Icons";
import { CONTACT_STATUSES, normalizeVietnamesePhone } from "@/helpers/contact-submissions";
import type { ContactStatus, ContactSubmissionItem } from "@/interfaces/contact";

interface ContactDetailModalProps {
  contact: ContactSubmissionItem;
  onClose: () => void;
  onStatusChange: (status: ContactStatus) => void;
}

/** Full submission with direct call / Zalo / email buttons and a status switcher. */
export const ContactDetailModal = ({ contact, onClose, onStatusChange }: ContactDetailModalProps) => {
  const phone = normalizeVietnamesePhone(contact.phone);

  return (
    <Modal
      isOpen
      onClose={onClose}
      isDismissable
      labelledBy="contact-detail-title"
      className="max-w-lg rounded-2xl bg-white border border-slate-200 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div>
          <h3 id="contact-detail-title" className="font-bold text-slate-900 text-sm sm:text-base">
            Chi tiết yêu cầu liên hệ
          </h3>
          <span className="text-[11px] text-slate-400">{new Date(contact.createdAt).toLocaleString("vi-VN")}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Khách hàng:</span>
            <strong className="text-slate-900 text-sm">{contact.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Loại yêu cầu:</span>
            <strong className="text-slate-800">
              {contact.type === "custom_order" ? "Đặt in áo / túi theo yêu cầu" : "Tư vấn chung"}
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {phone && (
            <>
              <a
                href={`tel:${phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Phone size={14} />
                <span>Gọi {contact.phone}</span>
              </a>
              <a
                href={`https://zalo.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0068FF] px-3 py-2 text-xs font-bold text-white hover:bg-[#0055d6] transition-colors shadow-xs"
              >
                <span>Nhắn Zalo</span>
                <ExternalLink size={13} />
              </a>
            </>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Mail size={14} />
              <span>Email</span>
            </a>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Nội dung tin nhắn khách gửi
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {contact.message}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Trạng thái xử lý</label>
          <div className="flex gap-2">
            {CONTACT_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => onStatusChange(status.value)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-all ${
                  contact.status === status.value
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

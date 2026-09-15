"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { MessageSquare } from "@/components/admin/Icons";
import { Pagination } from "@/components/admin/Pagination";
import { contactStatusOf, contactsFilterHref } from "@/helpers/contact-submissions";
import type { ContactCounts, ContactFilters, ContactStatus, ContactSubmissionItem } from "@/interfaces/contact";
import { ContactDetailModal } from "./ContactDetailModal";
import { ContactFilterBar } from "./ContactFilterBar";
import { ContactRow } from "./ContactRow";
import { ContactStatCards } from "./ContactStatCards";

interface ContactSubmissionsManagerProps {
  initialContacts: ContactSubmissionItem[];
  total: number;
  page: number;
  pageSize: number;
  counts: ContactCounts;
  currentFilters: ContactFilters;
}

/** Contact and custom-order requests: filters, table, status updates and a detail dialog. */
export const ContactSubmissionsManager = ({
  initialContacts,
  total,
  page,
  pageSize,
  counts,
  currentFilters,
}: ContactSubmissionsManagerProps) => {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactSubmissionItem[]>(initialContacts);
  // Kept as its own copy so the dialog stays open even if a refresh filters the contact out of the list
  const [selectedContact, setSelectedContact] = useState<ContactSubmissionItem | null>(null);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const onFilter = (filters: ContactFilters) => router.push(contactsFilterHref(filters));

  const onUpdateStatus = async (id: string, status: ContactStatus) => {
    try {
      await adminFetch(`/api/admin/contacts/${id}`, { method: "PATCH", body: { status } });
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      setSelectedContact((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast.success(`Đã chuyển sang "${contactStatusOf(status).label}"!`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  };

  const onDelete = async (contact: ContactSubmissionItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu liên hệ từ "${contact.fullName}"?`)) return;
    try {
      await adminFetch(`/api/admin/contacts/${contact.id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setSelectedContact((prev) => (prev?.id === contact.id ? null : prev));
      toast.success("Đã xóa yêu cầu liên hệ!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Yêu Cầu Liên Hệ &amp; Tư Vấn</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Danh sách khách hàng gửi yêu cầu hỗ trợ, tư vấn sản phẩm và đặt in áo / quà tặng theo yêu cầu.
        </p>
      </div>

      <ContactStatCards
        counts={counts}
        activeStatus={currentFilters.status}
        onStatusChange={(status) => onFilter({ ...currentFilters, status })}
      />

      <ContactFilterBar filters={currentFilters} counts={counts} onFilter={onFilter} />

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Khách hàng</th>
                <th className="py-3.5 px-4">Liên hệ nhanh</th>
                <th className="py-3.5 px-4">Loại yêu cầu</th>
                <th className="py-3.5 px-4">Nội dung tin nhắn</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs sm:text-sm">
                      {currentFilters.q ? "Không tìm thấy yêu cầu liên hệ phù hợp" : "Chưa có yêu cầu liên hệ nào"}
                    </p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onOpen={() => setSelectedContact(contact)}
                    onStatusChange={(status) => onUpdateStatus(contact.id, status)}
                    onDelete={() => onDelete(contact)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath="/admin/contacts"
            searchParams={{
              q: currentFilters.q || undefined,
              status: currentFilters.status !== "all" ? currentFilters.status : undefined,
              type: currentFilters.type !== "all" ? currentFilters.type : undefined,
            }}
          />
        </div>
      </div>

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onStatusChange={(status) => onUpdateStatus(selectedContact.id, status)}
        />
      )}
    </div>
  );
};

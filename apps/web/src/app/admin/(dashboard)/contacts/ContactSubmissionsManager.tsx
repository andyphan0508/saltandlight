"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Search,
  X,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Tag,
} from "@/components/admin/Icons";
import { toast } from "sonner";

export interface ContactSubmissionItem {
  id: string;
  type: string; // "contact" | "custom_order"
  fullName: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: "new" | "in_progress" | "closed";
  createdAt: string | Date;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: any }
> = {
  new: {
    label: "Chưa xử lý",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Clock,
  },
  in_progress: {
    label: "Đang xử lý",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    icon: MessageSquare,
  },
  closed: {
    label: "Đã hoàn tất",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
  },
};

export function ContactSubmissionsManager({
  initialContacts,
}: {
  initialContacts: ContactSubmissionItem[];
}) {
  const [contacts, setContacts] = useState<ContactSubmissionItem[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<ContactSubmissionItem | null>(null);

  async function handleUpdateStatus(id: string, newStatus: "new" | "in_progress" | "closed") {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật trạng thái");

      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Đã chuyển sang "${STATUS_CONFIG[newStatus]?.label}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(msg);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu liên hệ từ "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xóa");

      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
      toast.success("Đã xóa yêu cầu liên hệ!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xóa";
      toast.error(msg);
    }
  }

  function getCleanPhone(phone: string | null) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
    if (digits.startsWith("0")) return digits;
    return `0${digits}`;
  }

  const filtered = contacts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        c.fullName.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countNew = contacts.filter((c) => c.status === "new").length;
  const countInProgress = contacts.filter((c) => c.status === "in_progress").length;
  const countClosed = contacts.filter((c) => c.status === "closed").length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Quản Lý Yêu Cầu Liên Hệ &amp; Tư Vấn
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Danh sách khách hàng gửi yêu cầu hỗ trợ, tư vấn sản phẩm và đặt in áo / quà tặng theo yêu cầu.
        </p>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter("new")}
          className={`rounded-2xl p-4 sm:p-5 border text-left transition-all ${
            statusFilter === "new"
              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Yêu cầu mới chưa xử lý
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              {countNew}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{countNew}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("in_progress")}
          className={`rounded-2xl p-4 sm:p-5 border text-left transition-all ${
            statusFilter === "in_progress"
              ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Đang hỗ trợ / Xử lý
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              {countInProgress}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{countInProgress}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("closed")}
          className={`rounded-2xl p-4 sm:p-5 border text-left transition-all ${
            statusFilter === "closed"
              ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Đã hoàn tất
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {countClosed}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{countClosed}</div>
        </button>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl bg-white p-3 border border-slate-200/80 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          <Search size={16} className="text-slate-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại, email hoặc nội dung tin nhắn…"
            className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái ({contacts.length})</option>
            <option value="new">Chưa xử lý ({countNew})</option>
            <option value="in_progress">Đang xử lý ({countInProgress})</option>
            <option value="closed">Đã hoàn tất ({countClosed})</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả loại yêu cầu</option>
            <option value="contact">Liên hệ tư vấn chung</option>
            <option value="custom_order">Đặt in áo / quà tặng theo yêu cầu</option>
          </select>
        </div>
      </div>

      {/* 4. Submissions Table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs sm:text-sm">
                      {search ? "Không tìm thấy yêu cầu liên hệ phù hợp" : "Chưa có yêu cầu liên hệ nào"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const cleanPhone = getCleanPhone(item.phone);
                  const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.new;
                  const dateStr = new Date(item.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Name & Date */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="font-bold text-slate-900">{item.fullName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{dateStr}</div>
                      </td>

                      {/* Fast Contact Actions: Call / Zalo / Email */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {cleanPhone ? (
                            <>
                              <a
                                href={`tel:${cleanPhone}`}
                                title={`Gọi ngay ${item.phone}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <Phone size={12} />
                                <span>{item.phone}</span>
                              </a>
                              <a
                                href={`https://zalo.me/${cleanPhone}`}
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

                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              title={`Gửi email: ${item.email}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Mail size={12} />
                              <span className="max-w-[120px] truncate">{item.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Request Type */}
                      <td className="py-4 px-4">
                        {item.type === "custom_order" ? (
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

                      {/* Message excerpt */}
                      <td className="py-4 px-4 max-w-xs">
                        <p
                          className="line-clamp-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                          onClick={() => setSelectedContact(item)}
                          title="Bấm để xem đầy đủ nội dung"
                        >
                          {item.message}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              item.id,
                              e.target.value as "new" | "in_progress" | "closed"
                            )
                          }
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold focus:outline-none transition-all ${statusConf?.badgeClass || "bg-slate-100 text-slate-700"}`}
                        >
                          <option value="new">Chưa xử lý</option>
                          <option value="in_progress">Đang xử lý</option>
                          <option value="closed">Đã hoàn tất</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedContact(item)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-forest hover:bg-mint-50 transition-colors"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.fullName)}
                            title="Xóa yêu cầu"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detail View Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 animate-pop-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Chi tiết yêu cầu liên hệ
                </h3>
                <span className="text-[11px] text-slate-400">
                  {new Date(selectedContact.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Khách hàng:</span>
                  <strong className="text-slate-900 text-sm">{selectedContact.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Loại yêu cầu:</span>
                  <strong className="text-slate-800">
                    {selectedContact.type === "custom_order"
                      ? "Đặt in áo / túi theo yêu cầu"
                      : "Tư vấn chung"}
                  </strong>
                </div>
              </div>

              {/* Direct Reach Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedContact.phone && (
                  <>
                    <a
                      href={`tel:${getCleanPhone(selectedContact.phone)}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <Phone size={14} />
                      <span>Gọi {selectedContact.phone}</span>
                    </a>
                    <a
                      href={`https://zalo.me/${getCleanPhone(selectedContact.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0068FF] px-3 py-2 text-xs font-bold text-white hover:bg-[#0055d6] transition-colors shadow-xs"
                    >
                      <span>Nhắn Zalo</span>
                      <ExternalLink size={13} />
                    </a>
                  </>
                )}
                {selectedContact.email && (
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nội dung tin nhắn khách gửi
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>

              {/* Status updater */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Trạng thái xử lý
                </label>
                <div className="flex gap-2">
                  {(["new", "in_progress", "closed"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContact.id, st)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-all ${
                        selectedContact.status === st
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {STATUS_CONFIG[st]?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

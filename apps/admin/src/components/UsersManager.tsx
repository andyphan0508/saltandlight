"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import {
  UserPlus,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Users,
  Shield,
  Sparkles,
} from "./Icons";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: "owner" | "staff";
  isActive: boolean;
  createdAt?: string | Date;
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset password modal state
  const [selectedUserForPassword, setSelectedUserForPassword] =
    useState<AdminUserRow | null>(null);

  function generateRandomPassword() {
    const chars =
      "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    setShowPassword(true);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName: fullName.trim() || undefined,
          role,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra khi tạo tài khoản");
        return;
      }

      showToast(`Đã tạo thành công tài khoản cho ${email}!`);
      setEmail("");
      setFullName("");
      setPassword("");
      router.refresh();
    } catch (err: any) {
      setSubmitting(false);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    }
  }

  async function toggleActive(id: string, isActive: boolean, userEmail: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        showToast(
          isActive
            ? `Đã khóa tài khoản ${userEmail}`
            : `Đã mở khóa tài khoản ${userEmail}`,
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const activeCount = users.filter((u) => u.isActive).length;
  const ownerCount = users.filter((u) => u.role === "owner").length;

  return (
    <div className="space-y-8">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-brand-forest px-5 py-3.5 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle size={17} className="text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-100 text-brand-forest">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Tổng thành viên
            </p>
            <p className="text-xl font-black text-ink">{users.length}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Đang hoạt động
            </p>
            <p className="text-xl font-black text-ink">{activeCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Chủ shop (Owner)</p>
            <p className="text-xl font-black text-ink">{ownerCount}</p>
          </div>
        </div>
      </div>

      {/* Create User Form */}
      <div className="rounded-3xl border border-mint-200/80 bg-white p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-sm">
            <UserPlus size={18} />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-ink">
              Tạo tài khoản quản trị mới
            </h2>
            <p className="text-xs text-slate-500">
              Cấp tài khoản đăng nhập trực tiếp với email &amp; mật khẩu khởi tạo cho nhân viên
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Email đăng nhập <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhanvien@saltandlight.vn"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
              />
            </div>

            {/* Họ tên */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
              />
            </div>

            {/* Mật khẩu khởi tạo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Mật khẩu khởi tạo
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline"
                >
                  <Sparkles size={11} />
                  <span>Tự tạo ngẫu nhiên</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-9 text-xs font-medium text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Vai trò & Submit */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1">
                  Vai trò
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "staff" | "owner")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
                >
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="owner">Chủ shop (Owner)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-[38px] px-5 flex-shrink-0"
              >
                {submitting ? "Đang tạo…" : "Tạo tài khoản"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wide">
            Danh sách tài khoản ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Người dùng</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Vai trò</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUserId;
                const initial = (u.fullName || u.email).charAt(0).toUpperCase();

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest/10 font-bold text-xs text-brand-forest">
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-ink">
                            {u.fullName || "—"}
                            {isCurrent && (
                              <span className="ml-2 rounded-md bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest">
                                Bạn
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          u.role === "owner"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role === "owner" ? "Chủ shop" : "Nhân viên"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-semibold ${
                          u.isActive ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            u.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <span>
                          {u.isActive ? "Đang hoạt động" : "Đã khóa"}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Reset password button */}
                        <button
                          type="button"
                          onClick={() => setSelectedUserForPassword(u)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand-forest hover:text-brand-forest transition-all"
                        >
                          <KeyRound size={13} className="text-slate-400" />
                          <span>Đổi MK</span>
                        </button>

                        {/* Lock / Unlock button (not self) */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleActive(u.id, u.isActive, u.email)
                            }
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                              u.isActive
                                ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {u.isActive ? "Khóa" : "Mở khóa"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal for specific user */}
      {selectedUserForPassword && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setSelectedUserForPassword(null)}
          targetUserId={selectedUserForPassword.id}
          targetEmail={selectedUserForPassword.email}
          isSelf={selectedUserForPassword.id === currentUserId}
        />
      )}
    </div>
  );
}

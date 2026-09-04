"use client";

import { useState, type FormEvent } from "react";
import { Lock, Eye, EyeOff, X, CheckCircle, AlertTriangle } from "./Icons";
import { Button } from "@saltandlight/ui";

export function ChangePasswordModal({
  isOpen,
  onClose,
  targetUserId,
  targetEmail,
  isSelf = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetEmail?: string;
  isSelf?: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSelf
        ? "/api/admin/profile/change-password"
        : `/api/admin/users/${targetUserId}/password`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          password: newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra khi đổi mật khẩu.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-mint-200/80 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink">
                {isSelf ? "Đổi mật khẩu tài khoản" : "Cập nhật mật khẩu"}
              </h3>
              <p className="text-xs text-slate-400">
                {isSelf
                  ? "Tạo mật khẩu mới an toàn cho tài khoản của bạn"
                  : `Đặt mật khẩu mới cho ${targetEmail}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
              <CheckCircle size={32} />
            </div>
            <p className="font-bold text-emerald-800 text-base">
              Đổi mật khẩu thành công!
            </p>
            <p className="text-xs text-slate-500">
              Mật khẩu mới đã có hiệu lực ngay lập tức.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                Mật khẩu mới (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu…" : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

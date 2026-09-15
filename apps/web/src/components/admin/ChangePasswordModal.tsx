"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { Modal } from "@/components/Modal";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { Lock, Eye, EyeOff, X, CheckCircle, AlertTriangle } from "./Icons";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetEmail?: string;
  isSelf?: boolean;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  targetUserId,
  targetEmail,
  isSelf = true,
}: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
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

    setIsSaving(true);
    try {
      await adminFetch(isSelf ? "/api/admin/profile/change-password" : `/api/admin/users/${targetUserId}/password`, {
        method: "POST",
        body: { newPassword, password: newPassword },
      });
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi đổi mật khẩu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-white max-w-md rounded-3xl border border-mint-200/80" labelledBy="change-password-title">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <Lock size={20} />
            </div>
            <div>
              <h3 id="change-password-title" className="font-display font-bold text-base text-ink">
                {isSelf ? "Đổi mật khẩu tài khoản" : "Cập nhật mật khẩu"}
              </h3>
              <p className="text-xs text-slate-400">
                {isSelf ? "Tạo mật khẩu mới an toàn cho tài khoản của bạn" : `Đặt mật khẩu mới cho ${targetEmail}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {isDone ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-pop-in">
              <CheckCircle size={32} />
            </div>
            <p className="font-bold text-emerald-800 text-base">Đổi mật khẩu thành công!</p>
            <p className="text-xs text-slate-500">Mật khẩu mới đã có hiệu lực ngay lập tức.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                  type={isPasswordVisible ? "text" : "password"}
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
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                  tabIndex={-1}
                >
                  {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu…" : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

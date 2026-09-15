"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { AlertTriangle, Eye, EyeOff, Sparkles, UserPlus } from "@/components/admin/Icons";
import { generatePassword } from "@/helpers/password";
import type { AdminRole } from "@/interfaces/admin-user";

const labelClass = "block text-xs font-bold uppercase tracking-wider text-ink/70";
const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15";

/** Creates an admin account with email, optional name, role and an initial password. */
export const CreateUserForm = ({ onCreated }: { onCreated: () => void }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AdminRole>("staff");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGeneratePassword = () => {
    setPassword(generatePassword());
    setIsPasswordVisible(true);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await adminFetch("/api/admin/users", {
        method: "POST",
        body: { email, fullName: fullName.trim() || undefined, role, password: password.trim() || undefined },
      });
      toast.success(`Đã tạo thành công tài khoản cho ${email}!`);
      setEmail("");
      setFullName("");
      setPassword("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo tài khoản");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-mint-200/80 bg-white p-6 sm:p-8 shadow-card">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-sm">
          <UserPlus size={18} />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-ink">Tạo tài khoản quản trị mới</h2>
          <p className="text-xs text-slate-500">Cấp tài khoản đăng nhập trực tiếp với email &amp; mật khẩu khởi tạo cho nhân viên</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className={`${labelClass} mb-1`}>
              Email đăng nhập <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@saltandlight.vn"
              className={inputClass}
            />
          </div>

          <div>
            <label className={`${labelClass} mb-1`}>Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className={inputClass} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass}>Mật khẩu khởi tạo</label>
              <button
                type="button"
                onClick={onGeneratePassword}
                className="flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline"
              >
                <Sparkles size={11} />
                <span>Tự tạo ngẫu nhiên</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                className={`${inputClass} pr-9`}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                tabIndex={-1}
              >
                {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className={`${labelClass} mb-1`}>Vai trò</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-ink focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/15"
              >
                <option value="staff">Nhân viên (Staff)</option>
                <option value="owner">Chủ shop (Owner)</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="h-[38px] px-5 flex-shrink-0">
              {isSubmitting ? "Đang tạo…" : "Tạo tài khoản"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

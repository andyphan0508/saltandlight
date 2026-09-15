"use client";

import { KeyRound } from "@/components/admin/Icons";
import type { AdminUserRow } from "@/interfaces/admin-user";

interface UserRowProps {
  user: AdminUserRow;
  isCurrent: boolean;
  onChangePassword: () => void;
  onToggleActive: () => void;
}

/** One admin account: name, email, role, status, change-password and (for others) lock/unlock. */
export const UserRow = ({ user, isCurrent, onChangePassword, onToggleActive }: UserRowProps) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-forest/10 font-bold text-xs text-brand-forest">
          {(user.fullName || user.email).charAt(0).toUpperCase()}
        </div>
        <p className="font-bold text-ink">
          {user.fullName || "—"}
          {isCurrent && (
            <span className="ml-2 rounded-md bg-mint-100 px-2 py-0.5 text-[10px] font-bold text-brand-forest">Bạn</span>
          )}
        </p>
      </div>
    </td>

    <td className="px-6 py-4 font-mono text-slate-600">{user.email}</td>

    <td className="px-6 py-4">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
          user.role === "owner" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
        }`}
      >
        {user.role === "owner" ? "Chủ shop" : "Nhân viên"}
      </span>
    </td>

    <td className="px-6 py-4">
      <span className={`inline-flex items-center gap-1.5 font-semibold ${user.isActive ? "text-emerald-600" : "text-slate-400"}`}>
        <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
        <span>{user.isActive ? "Đang hoạt động" : "Đã khóa"}</span>
      </span>
    </td>

    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onChangePassword}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand-forest hover:text-brand-forest transition-all"
        >
          <KeyRound size={13} className="text-slate-400" />
          <span>Đổi MK</span>
        </button>

        {!isCurrent && (
          <button
            type="button"
            onClick={onToggleActive}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              user.isActive
                ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
                : "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {user.isActive ? "Khóa" : "Mở khóa"}
          </button>
        )}
      </div>
    </td>
  </tr>
);

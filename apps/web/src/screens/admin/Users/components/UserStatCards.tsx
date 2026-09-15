"use client";

import { CheckCircle, Shield, Users } from "@/components/admin/Icons";
import type { AdminUserRow } from "@/interfaces/admin-user";

/** Member, active and owner counts for the users on this page. */
export const UserStatCards = ({ users }: { users: AdminUserRow[] }) => {
  const cards = [
    { label: "Tổng thành viên", value: users.length, icon: Users, iconClass: "bg-mint-100 text-brand-forest" },
    { label: "Đang hoạt động", value: users.filter((u) => u.isActive).length, icon: CheckCircle, iconClass: "bg-emerald-100 text-emerald-700" },
    { label: "Chủ shop (Owner)", value: users.filter((u) => u.role === "owner").length, icon: Shield, iconClass: "bg-amber-100 text-amber-800" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, iconClass }) => (
        <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
            <p className="text-xl font-bold text-ink">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";
import { Pagination } from "@/components/admin/Pagination";
import type { AdminUserRow } from "@/interfaces/admin-user";
import { CreateUserForm } from "./CreateUserForm";
import { UserRow } from "./UserRow";
import { UserStatCards } from "./UserStatCards";

interface UsersManagerProps {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  currentUserId: string;
}

/** Admin accounts: counts, create form, table with lock/unlock and per-user password change. */
export const UsersManager = ({ users, total, page, pageSize, currentUserId }: UsersManagerProps) => {
  const router = useRouter();
  const [passwordTarget, setPasswordTarget] = useState<AdminUserRow | null>(null);

  const onToggleActive = async (user: AdminUserRow) => {
    try {
      await adminFetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: { isActive: !user.isActive } });
      toast.success(user.isActive ? `Đã khóa tài khoản ${user.email}` : `Đã mở khóa tài khoản ${user.email}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật tài khoản");
    }
  };

  return (
    <div className="space-y-8">
      <UserStatCards users={users} />

      <CreateUserForm onCreated={() => router.refresh()} />

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-ink uppercase tracking-wide">Danh sách tài khoản ({total})</h3>
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
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isCurrent={user.id === currentUserId}
                  onChangePassword={() => setPasswordTarget(user)}
                  onToggleActive={() => onToggleActive(user)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4">
          <Pagination page={page} pageSize={pageSize} total={total} basePath="/admin/users" />
        </div>
      </div>

      {passwordTarget && (
        <ChangePasswordModal
          isOpen
          onClose={() => setPasswordTarget(null)}
          targetUserId={passwordTarget.id}
          targetEmail={passwordTarget.email}
          isSelf={passwordTarget.id === currentUserId}
        />
      )}
    </div>
  );
};

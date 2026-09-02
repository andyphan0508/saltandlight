"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@saltandlight/ui";

interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: "owner" | "staff";
  isActive: boolean;
}

export function UsersManager({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInviting(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        fullName: form.get("fullName") || undefined,
        role: form.get("role"),
      }),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) {
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-white p-5 shadow-card">
        <div>
          <label className="text-xs font-bold uppercase text-ink/50">Email</label>
          <input name="email" type="email" required className="mt-1 w-56 rounded-lg border border-ink/15 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-ink/50">Họ tên</label>
          <input name="fullName" className="mt-1 w-48 rounded-lg border border-ink/15 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-ink/50">Vai trò</label>
          <select name="role" defaultValue="staff" className="mt-1 rounded-lg border border-ink/15 px-3 py-1.5 text-sm">
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <Button type="submit" size="sm" disabled={inviting}>
          {inviting ? "Đang mời…" : "Mời nhân viên"}
        </Button>
        {error && <p className="w-full text-sm text-sale">{error}</p>}
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.fullName ?? "—"}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.isActive ? "Đang hoạt động" : "Đã khóa"}</td>
                <td className="px-4 py-3">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className="text-xs font-semibold uppercase text-ink/60 hover:text-ink"
                    >
                      {u.isActive ? "Khóa" : "Mở khóa"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

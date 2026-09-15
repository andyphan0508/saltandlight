export type AdminRole = "owner" | "staff";

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt?: string | Date;
}

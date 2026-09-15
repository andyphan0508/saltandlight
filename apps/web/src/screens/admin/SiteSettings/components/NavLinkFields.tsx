"use client";

import { TextField } from "@/components/admin/form-fields";
import type { NavLinkItem } from "@/interfaces/site-settings";

export const newNavLink = (): NavLinkItem => ({ label: "", href: "/" });

interface NavLinkFieldsProps {
  item: NavLinkItem;
  onUpdate: (patch: Partial<NavLinkItem>) => void;
}

export const NavLinkFields = ({ item, onUpdate }: NavLinkFieldsProps) => (
  <div className="grid grid-cols-2 gap-2">
    <TextField label="Tên mục" value={item.label} onChange={(v) => onUpdate({ label: v })} placeholder="Trang chủ" />
    <TextField label="Đường dẫn" value={item.href} onChange={(v) => onUpdate({ href: v })} placeholder="/" />
  </div>
);

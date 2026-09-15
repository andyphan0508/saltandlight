"use client";

import { Layers, Pencil, Plus } from "@/components/admin/Icons";
import type { EditorTab } from "@/hooks/use-page-block-editor";

interface EditorPanelTabsProps {
  activeTab: EditorTab;
  blockCount: number;
  onTabChange: (tab: EditorTab) => void;
}

export const EditorPanelTabs = ({ activeTab, blockCount, onTabChange }: EditorPanelTabsProps) => {
  const tabs = [
    { id: "navigator" as const, label: `Cấu trúc (${blockCount})`, icon: Layers },
    { id: "edit" as const, label: "Chỉnh sửa", icon: Pencil },
    { id: "palette" as const, label: "Thêm khối", icon: Plus },
  ];

  return (
    <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-3 pt-2 shrink-0">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === id ? "border-brand-forest text-brand-forest" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

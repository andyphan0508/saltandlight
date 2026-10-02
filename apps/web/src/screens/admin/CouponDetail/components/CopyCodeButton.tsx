"use client";

import { useState } from "react";
import { Check, Copy } from "@/components/admin/Icons";

export const CopyCodeButton = ({ code }: { code: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Sao chép mã ${code}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        } catch {
          // Clipboard blocked: the code is on screen to copy by hand
        }
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isCopied ? "bg-emerald-50 text-emerald-700" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
    >
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

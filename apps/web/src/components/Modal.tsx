"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Panel classes: width, background, radius, border, layout… */
  className?: string;
  /** Close on backdrop click and Escape. Keep it off for forms so a stray click can't discard typed input. */
  isDismissable?: boolean;
  labelledBy?: string;
}

/**
 * Centered modal rendered into <body>. Deliberately not a native <dialog>:
 * showModal() puts it in the top layer, above sonner toasts that admin
 * forms use to report errors while the modal stays open.
 * Page scroll is locked by `body:has([data-modal])` in globals.css.
 */
export const Modal = ({ isOpen, onClose, children, className = "", isDismissable = false, labelledBy }: ModalProps) => {
  useEffect(() => {
    if (!isOpen || !isDismissable) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isDismissable, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-modal
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-xs animate-fade-in"
      onClick={isDismissable ? (e) => e.target === e.currentTarget && onClose() : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full shadow-2xl animate-pop-in ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "animate-rise relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-[0_40px_80px_-24px_rgba(27,20,32,0.4)]",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-linear-to-r from-rose-400 via-purple-400 to-amber-300" />
        <div className="mb-5 flex items-center justify-between">
          {title && <h2 className="font-display text-2xl text-ink">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isSubmitting = false,
  variant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  variant?: "primary" | "danger";
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant={variant}
          fullWidth
          onClick={onConfirm}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

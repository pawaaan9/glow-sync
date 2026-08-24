"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { reasonRequiredSchema, type ReasonRequiredInput } from "@/lib/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/**
 * Shared by "reject an application" and "suspend a salon" — both require a
 * reason, validated against the same schema the backend enforces.
 */
export function ReasonModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  isSubmitting = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title: string;
  description: string;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReasonRequiredInput>({ resolver: zodResolver(reasonRequiredSchema) });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
      <form
        onSubmit={handleSubmit((values) => onSubmit(values.reason))}
        className="mt-4 flex flex-col gap-2"
      >
        <label className="text-sm font-medium text-neutral-800" htmlFor="reason">
          Reason
        </label>
        <textarea
          id="reason"
          rows={4}
          placeholder="Explain the reason — this will be shown to the salon owner."
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          {...register("reason")}
        />
        {errors.reason && <p className="text-xs text-red-600">{errors.reason.message}</p>}

        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

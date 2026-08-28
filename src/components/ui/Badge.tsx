import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "neutral"
  | "rose"
  | "purple"
  | "amber"
  | "success"
  | "warning"
  | "danger"
  | "glass";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  rose: "bg-rose-100 text-rose-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  glass: "glass text-ink shadow-sm ring-1 ring-white/60",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Tone + human label for every status string that reaches a badge: salon
 * lifecycle (SALON_STATUS), owner verification (VERIFICATION_STATUS), and
 * verification-history actions. Keys are the wire values —
 * UPPERCASE_SNAKE — so a raw DTO field can be passed straight in.
 */
const statusMeta: Record<string, { variant: BadgeVariant; label: string }> = {
  // Salon lifecycle
  PENDING_APPROVAL: { variant: "warning", label: "Pending" },
  ACTIVE: { variant: "success", label: "Active" },
  REJECTED: { variant: "danger", label: "Rejected" },
  SUSPENDED: { variant: "neutral", label: "Suspended" },
  // Owner verification
  PENDING_VERIFICATION: { variant: "warning", label: "Pending" },
  APPROVED: { variant: "success", label: "Approved" },
  // Verification-history actions
  SUBMITTED: { variant: "purple", label: "Submitted" },
  RESUBMITTED: { variant: "purple", label: "Resubmitted" },
  REACTIVATED: { variant: "success", label: "Reactivated" },
};

/** Title-cases an unmapped status so a new value never renders as raw SNAKE_CASE. */
function humanizeStatus(status: string) {
  return status
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta[status];
  return (
    <Badge variant={meta?.variant ?? "neutral"} className={cn("whitespace-nowrap", className)}>
      <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" />
      {meta?.label ?? humanizeStatus(status)}
    </Badge>
  );
}

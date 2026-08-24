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

const statusVariant: Record<string, BadgeVariant> = {
  pending: "warning",
  confirmed: "purple",
  completed: "success",
  cancelled: "danger",
  active: "success",
  inactive: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "neutral"} className="capitalize">
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </Badge>
  );
}

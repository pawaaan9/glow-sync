import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

/**
 * The masthead every admin page opens with: a gradient icon chip, title,
 * one line of context, and an optional action slot that drops below the
 * text on narrow screens instead of squeezing it.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {Icon && (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-[0_10px_24px_-14px_var(--color-purple-500)] sm:size-12">
            <Icon className="size-5 sm:size-5.5" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow text-rose-500">{eyebrow}</p>}
          <h1 className="font-display text-xl text-ink sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

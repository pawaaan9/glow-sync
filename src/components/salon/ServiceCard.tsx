import type { PublicServiceDTO } from "@/lib/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Clock } from "lucide-react";

export function ServiceCard({
  service,
  className,
}: {
  service: PublicServiceDTO;
  className?: string;
}) {
  const hasDiscount = service.discountedPriceLkr !== null;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white p-4 transition-all duration-300 hover:border-rose-200 hover:shadow-[0_16px_40px_-32px_rgba(217,36,88,0.5)]",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 scale-y-0 bg-linear-to-b from-rose-400 to-purple-500 transition-transform duration-300 group-hover:scale-y-100" />

      <div className="min-w-0 flex-1">
        <h4 className="font-display text-lg text-ink">{service.name}</h4>
        {service.description && (
          <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {service.description}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          <Clock className="size-3" />
          {formatDuration(service.durationMinutes)}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        {hasDiscount && (
          <span className="text-xs text-neutral-400 line-through">
            {formatCurrency(service.priceLkr)}
          </span>
        )}
        <span className="font-display text-xl text-ink">
          {formatCurrency(service.discountedPriceLkr ?? service.priceLkr)}
        </span>
      </div>
    </div>
  );
}

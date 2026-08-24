import { Button } from "@/components/ui/Button";
import type { Service } from "@/lib/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Check, Clock } from "lucide-react";
import Image from "next/image";

export function ServiceCard({
  service,
  selected,
  onSelect,
  className,
}: {
  service: Service;
  selected?: boolean;
  onSelect?: (service: Service) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-3xl border p-4 transition-all duration-300",
        selected
          ? "border-rose-300 bg-linear-to-r from-rose-50 to-purple-50/60 shadow-[0_16px_40px_-28px_var(--color-rose-500)]"
          : "border-neutral-100 bg-white hover:border-rose-200 hover:shadow-[0_16px_40px_-32px_rgba(217,36,88,0.5)]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 bg-linear-to-b from-rose-400 to-purple-500 transition-transform duration-300",
          selected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
        )}
      />

      {service.imageUrl && (
        <div className="relative hidden size-18 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:block">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            sizes="72px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h4 className="font-display text-lg text-ink">{service.name}</h4>
        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {service.description}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          <Clock className="size-3" />
          {formatDuration(service.durationMinutes)}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-xl text-ink">
          {formatCurrency(service.price)}
        </span>
        {onSelect && (
          <Button
            size="sm"
            variant={selected ? "primary" : "outline"}
            onClick={() => onSelect(service)}
            icon={selected ? <Check className="size-3.5" /> : undefined}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        )}
      </div>
    </div>
  );
}

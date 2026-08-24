import { Button } from "@/components/ui/Button";
import type { Service } from "@/lib/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Clock } from "lucide-react";
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
        "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
        selected ? "border-rose-300 bg-rose-50/50" : "border-neutral-100 bg-white hover:border-rose-200",
        className,
      )}
    >
      {service.imageUrl && (
        <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:block">
          <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-neutral-900">{service.name}</h4>
        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">{service.description}</p>
        <span className="mt-1.5 flex items-center gap-1 text-xs text-neutral-400">
          <Clock className="size-3.5" />
          {formatDuration(service.durationMinutes)}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-lg text-neutral-900">
          {formatCurrency(service.price)}
        </span>
        {onSelect && (
          <Button
            size="sm"
            variant={selected ? "primary" : "outline"}
            onClick={() => onSelect(service)}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        )}
      </div>
    </div>
  );
}

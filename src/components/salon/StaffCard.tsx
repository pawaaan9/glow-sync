import { RatingStars } from "@/components/salon/RatingStars";
import type { StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

export function StaffCard({
  staff,
  selected,
  onSelect,
  className,
}: {
  staff: StaffMember;
  selected?: boolean;
  onSelect?: (staff: StaffMember) => void;
  className?: string;
}) {
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(staff) : undefined}
      className={cn(
        "group relative flex flex-col items-center gap-2.5 rounded-3xl border p-5 text-center transition-all duration-300",
        onSelect && "cursor-pointer hover:-translate-y-1",
        selected
          ? "border-rose-300 bg-linear-to-b from-rose-50 to-white shadow-[0_18px_40px_-28px_var(--color-rose-500)]"
          : "border-neutral-100 bg-white hover:border-rose-200 hover:shadow-[0_18px_40px_-32px_rgba(217,36,88,0.5)]",
        className,
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-rose-500 text-white">
          <Check className="size-3.5" />
        </span>
      )}

      <div className="relative">
        {/* Gradient ring that fills in on hover / selection. */}
        <span
          className={cn(
            "absolute -inset-1 rounded-full bg-linear-to-br from-rose-400 via-purple-400 to-amber-300 transition-opacity duration-300",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        />
        <div className="relative size-20 overflow-hidden rounded-full bg-neutral-100 ring-3 ring-white">
          {staff.avatarUrl && (
            <Image
              src={staff.avatarUrl}
              alt={staff.name}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </div>
      </div>

      <div>
        <p className="font-display text-base text-ink">{staff.name}</p>
        <p className="text-xs tracking-tight text-rose-600">{staff.role}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <RatingStars rating={staff.rating} size={12} />
        <span className="text-xs text-neutral-400">({staff.reviewCount})</span>
      </div>

      {staff.specialties.length > 0 && (
        <p className="line-clamp-1 text-xs text-neutral-400">
          {staff.specialties.join(" · ")}
        </p>
      )}
    </Wrapper>
  );
}

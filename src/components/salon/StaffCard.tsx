import { RatingStars } from "@/components/salon/RatingStars";
import type { StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";
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
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
        onSelect && "cursor-pointer",
        selected ? "border-rose-300 bg-rose-50/50" : "border-neutral-100 bg-white hover:border-rose-200",
        className,
      )}
    >
      <div className="relative size-16 overflow-hidden rounded-full bg-neutral-100">
        {staff.avatarUrl && (
          <Image src={staff.avatarUrl} alt={staff.name} fill className="object-cover" />
        )}
      </div>
      <div>
        <p className="font-medium text-neutral-900">{staff.name}</p>
        <p className="text-xs text-neutral-500">{staff.role}</p>
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

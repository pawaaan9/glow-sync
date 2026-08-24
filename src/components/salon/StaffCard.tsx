import type { PublicStaffDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

/** Initials stand in when a team member has no photo uploaded. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function StaffCard({
  staff,
  className,
}: {
  staff: PublicStaffDTO;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-2.5 rounded-3xl border border-neutral-100 bg-white p-5 text-center transition-all duration-300 hover:border-rose-200 hover:shadow-[0_18px_40px_-32px_rgba(217,36,88,0.5)]",
        className,
      )}
    >
      <div className="relative">
        <span className="absolute -inset-1 rounded-full bg-linear-to-br from-rose-400 via-purple-400 to-amber-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative size-20 overflow-hidden rounded-full bg-linear-to-br from-rose-100 to-purple-100 ring-3 ring-white">
          {staff.photoUrl ? (
            <Image
              src={staff.photoUrl}
              alt={staff.fullName}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <span className="font-display flex size-full items-center justify-center text-lg text-rose-700">
              {initials(staff.fullName)}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="font-display text-base text-ink">{staff.fullName}</p>
        <p className="text-xs tracking-tight text-rose-600">{staff.jobTitle}</p>
      </div>

      {staff.bio && (
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">{staff.bio}</p>
      )}
    </div>
  );
}

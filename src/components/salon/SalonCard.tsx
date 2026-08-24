import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { SALON_CATEGORY_LABELS } from "@/lib/shared";
import type { PublicSalonSummaryDTO } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

export function SalonCard({
  salon,
  className,
  style,
}: {
  salon: PublicSalonSummaryDTO;
  className?: string;
  style?: CSSProperties;
}) {
  const cover = salon.coverImageUrl ?? salon.logoUrl;

  return (
    <Link
      href={`/salons/${salon.slug}`}
      style={style}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-[0_28px_60px_-30px_rgba(217,36,88,0.55)]",
        className,
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
        {cover ? (
          <Image
            src={cover}
            alt={salon.name}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          // No photo uploaded yet — a branded placeholder beats a stock image.
          <div className="flex size-full items-center justify-center bg-linear-to-br from-rose-100 via-purple-100 to-amber-50">
            <CategoryIcon
              category={salon.category}
              className="size-12 text-rose-400/70 transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <Badge variant="glass">{SALON_CATEGORY_LABELS[salon.category]}</Badge>
        </div>

        <span className="absolute right-4 top-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4.5" />
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <h3 className="font-display truncate text-xl text-white">{salon.name}</h3>
          <span className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <MapPin className="size-3.5" />
            {salon.city}, {salon.district}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {salon.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-neutral-200 pt-3.5 text-sm">
          <span className="text-neutral-400">
            {salon.serviceCount === 0
              ? "No services listed yet"
              : `${salon.serviceCount} service${salon.serviceCount === 1 ? "" : "s"}`}
          </span>
          {salon.fromPriceLkr !== null && (
            <span className="font-display shrink-0 text-lg text-rose-600">
              {formatCurrency(salon.fromPriceLkr)}
              <span className="ml-1 text-xs font-normal tracking-normal text-neutral-400">
                onwards
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

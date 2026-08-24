import { Badge } from "@/components/ui/Badge";
import { computeSalonPriceFrom } from "@/lib/mock-data";
import type { Salon } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

export function SalonCard({
  salon,
  className,
  style,
}: {
  salon: Salon;
  className?: string;
  style?: CSSProperties;
}) {
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
        <Image
          src={salon.coverImageUrl}
          alt={salon.name}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {salon.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="glass" className="capitalize">
              {c}
            </Badge>
          ))}
          {salon.featured && (
            <Badge className="bg-amber-400 text-amber-950">Featured</Badge>
          )}
        </div>

        <span className="absolute right-4 top-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4.5" />
        </span>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display truncate text-xl text-white">{salon.name}</h3>
            <span className="mt-1 flex items-center gap-1 text-xs text-white/80">
              <MapPin className="size-3.5" />
              {salon.city}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-semibold text-ink backdrop-blur">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {salon.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {salon.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-neutral-200 pt-3.5 text-sm">
          <span className="text-neutral-400">
            {salon.reviewCount.toLocaleString()} reviews
          </span>
          <span className="font-display text-lg text-rose-600">
            {formatCurrency(computeSalonPriceFrom(salon))}
            <span className="ml-1 text-xs font-normal tracking-normal text-neutral-400">
              onwards
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

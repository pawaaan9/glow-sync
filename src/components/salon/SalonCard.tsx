import { Badge } from "@/components/ui/Badge";
import { computeSalonPriceFrom } from "@/lib/mock-data";
import type { Salon } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SalonCard({ salon }: { salon: Salon }) {
  return (
    <Link
      href={`/salons/${salon.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-lg hover:shadow-rose-100/60"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
        <Image
          src={salon.coverImageUrl}
          alt={salon.name}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {salon.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="neutral" className="bg-white/90 capitalize backdrop-blur">
              {c}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base text-neutral-900">{salon.name}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-neutral-800">
            <Star className="size-3.5 fill-rose-400 text-rose-400" />
            {salon.rating.toFixed(1)}
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-neutral-500">{salon.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="flex items-center gap-1 text-neutral-500">
            <MapPin className="size-3.5" />
            {salon.city}
          </span>
          <span className="font-medium text-rose-600">
            From {formatCurrency(computeSalonPriceFrom(salon))}
          </span>
        </div>
      </div>
    </Link>
  );
}

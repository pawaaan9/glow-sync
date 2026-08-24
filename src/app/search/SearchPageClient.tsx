"use client";

import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { SalonCard } from "@/components/salon/SalonCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCities, useSalons } from "@/hooks/use-salons";
import { serviceCategories } from "@/lib/mock-data";
import type { SalonSearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  MapPin,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

const sortOptions: { value: NonNullable<SalonSearchFilters["sort"]>; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const ratingOptions = [0, 4, 4.5];

const selectClasses =
  "h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white pr-10 text-sm text-ink outline-none transition-all duration-200 hover:border-neutral-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

export function SearchPageClient({
  initialQuery,
  initialCity,
  initialCategory,
}: {
  initialQuery: string;
  initialCity: string;
  initialCategory: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SalonSearchFilters["sort"]>("recommended");

  const filters = useMemo<SalonSearchFilters>(
    () => ({
      query: query || undefined,
      city: city || undefined,
      category: category || undefined,
      minRating,
      sort,
    }),
    [query, city, category, minRating, sort],
  );

  const { data: salons, isLoading, isFetching } = useSalons(filters);
  const { data: cities } = useCities();

  const hasFilters = Boolean(query || city || category || minRating);

  function resetFilters() {
    setQuery("");
    setCity("");
    setCategory("");
    setMinRating(undefined);
    setSort("recommended");
  }

  return (
    <div className="relative">
      {/* Tinted banner so the filter bar reads as a distinct layer. */}
      <div className="aurora grain absolute inset-x-0 top-0 h-72 opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <span className="eyebrow flex items-center gap-2 text-rose-600">
            <span className="h-px w-6 bg-rose-300" />
            Search
          </span>
          <h1 className="font-display font-display-tight text-[clamp(2rem,5vw,3.25rem)] text-ink">
            Find your next appointment
          </h1>
          <p className="text-neutral-500">
            {isLoading ? (
              "Searching across every partner studio..."
            ) : (
              <>
                <strong className="text-ink">{salons?.length ?? 0}</strong> salons
                match your filters
              </>
            )}
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-8 rounded-4xl border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_-32px_rgba(217,36,88,0.5)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              icon={<Search className="size-4" />}
              placeholder="Search treatments, salons, spas..."
              aria-label="Search treatments or salons"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="lg:flex-1"
            />

            <div className="flex gap-3">
              <div className="relative flex-1 lg:w-48">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="City"
                  className={cn(selectClasses, "pl-11")}
                >
                  <option value="">All cities</option>
                  {cities?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              </div>

              <div className="relative flex-1 lg:w-52">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as SalonSearchFilters["sort"])
                  }
                  aria-label="Sort results"
                  className={cn(selectClasses, "pl-11")}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
            <button
              onClick={() => setCategory("")}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition-all duration-200",
                category === ""
                  ? "border-transparent bg-linear-to-r from-rose-500 to-purple-500 text-white shadow-[0_6px_18px_-8px_var(--color-rose-500)]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700",
              )}
            >
              All
            </button>

            {serviceCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition-all duration-200",
                  category === c.id
                    ? "border-transparent bg-linear-to-r from-rose-500 to-purple-500 text-white shadow-[0_6px_18px_-8px_var(--color-rose-500)]"
                    : "border-neutral-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700",
                )}
              >
                <CategoryIcon icon={c.icon} className="size-3.5" />
                {c.name}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5">
              {ratingOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r === 0 ? undefined : r)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200",
                    (minRating ?? 0) === r
                      ? "border-transparent bg-ink text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-purple-300",
                  )}
                >
                  {r !== 0 && (
                    <Star
                      className={cn(
                        "size-3",
                        (minRating ?? 0) === r
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-300 text-neutral-300",
                      )}
                    />
                  )}
                  {r === 0 ? "Any rating" : `${r}+`}
                </button>
              ))}

              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:text-rose-600"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SalonCardSkeleton key={i} />
              ))}
            </div>
          ) : salons && salons.length > 0 ? (
            <div
              className={cn(
                "grid grid-cols-1 gap-6 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3",
                isFetching && "opacity-50",
              )}
            >
              {salons.map((salon, i) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  className="animate-rise"
                  // Stagger the entrance so results cascade in.
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-4xl border border-dashed border-neutral-200 py-24 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-rose-100 to-purple-100 text-rose-500">
                <SearchX className="size-7" />
              </span>
              <h3 className="font-display text-xl text-ink">Nothing here yet</h3>
              <p className="max-w-sm text-sm text-neutral-500">
                No salons match your filters. Try widening the search or clearing a
                filter or two.
              </p>
              <Button onClick={resetFilters} variant="outline" size="sm">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SalonCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white">
      <div className="animate-shimmer aspect-4/3 w-full bg-size-[200%_100%] bg-linear-to-r from-neutral-100 via-neutral-200 to-neutral-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-4 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-4 w-1/2 rounded-full bg-neutral-100" />
        <div className="mt-2 h-4 w-1/3 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

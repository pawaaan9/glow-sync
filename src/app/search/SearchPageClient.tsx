"use client";

import { CategoryIcon } from "@/components/salon/CategoryIcon";
import { SalonCard } from "@/components/salon/SalonCard";
import { Input } from "@/components/ui/Input";
import { useCities, useSalons } from "@/hooks/use-salons";
import { serviceCategories } from "@/lib/mock-data";
import type { SalonSearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

const sortOptions: { value: NonNullable<SalonSearchFilters["sort"]>; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Find your next appointment</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {isLoading ? "Searching..." : `${salons?.length ?? 0} salons found`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 sm:flex-row sm:items-center">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search treatments, salons, spas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:flex-1"
        />
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-44">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="">All cities</option>
              {cities?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SalonSearchFilters["sort"])}
            className="h-11 w-full flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 sm:w-44"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory("")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            category === ""
              ? "border-rose-400 bg-rose-500 text-white"
              : "border-neutral-200 text-neutral-600 hover:border-rose-300",
          )}
        >
          All
        </button>
        {serviceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c.id
                ? "border-rose-400 bg-rose-500 text-white"
                : "border-neutral-200 text-neutral-600 hover:border-rose-300",
            )}
          >
            <CategoryIcon icon={c.icon} className="size-3.5" />
            {c.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r === 0 ? undefined : r)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                (minRating ?? 0) === r
                  ? "border-purple-400 bg-purple-500 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-purple-300",
              )}
            >
              {r === 0 ? "Any rating" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-24 text-neutral-400">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading salons...</p>
          </div>
        ) : salons && salons.length > 0 ? (
          <div
            className={cn(
              "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity",
              isFetching && "opacity-60",
            )}
          >
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-24 text-center text-neutral-400">
            <SearchX className="size-8" />
            <p className="text-sm">No salons match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

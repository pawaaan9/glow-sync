import { useQuery } from "@tanstack/react-query";
import { getPublicFilters, getSalonBySlug, getSalons } from "@/lib/api";
import type { SalonSearchFilters } from "@/lib/types";

export function useSalons(filters: SalonSearchFilters = {}) {
  return useQuery({
    queryKey: ["salons", filters],
    queryFn: () => getSalons(filters),
  });
}

export function useSalon(slug: string) {
  return useQuery({
    queryKey: ["salon", slug],
    queryFn: () => getSalonBySlug(slug),
    enabled: Boolean(slug),
  });
}

/** Cities and categories that actually have a live salon behind them. */
export function usePublicFilters() {
  return useQuery({
    queryKey: ["public-filters"],
    queryFn: getPublicFilters,
  });
}

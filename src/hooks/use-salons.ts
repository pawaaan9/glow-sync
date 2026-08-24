import { useQuery } from "@tanstack/react-query";
import { getCities, getFeaturedSalons, getSalonBySlug, getSalons } from "@/lib/api";
import type { SalonSearchFilters } from "@/lib/types";

export function useSalons(filters: SalonSearchFilters = {}) {
  return useQuery({
    queryKey: ["salons", filters],
    queryFn: () => getSalons(filters),
  });
}

export function useFeaturedSalons() {
  return useQuery({
    queryKey: ["salons", "featured"],
    queryFn: getFeaturedSalons,
  });
}

export function useSalon(slug: string) {
  return useQuery({
    queryKey: ["salon", slug],
    queryFn: () => getSalonBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
  });
}

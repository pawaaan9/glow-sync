import { apiGet } from "./http";
import type {
  PublicFiltersDTO,
  PublicSalonDetailDTO,
  PublicSalonSummaryDTO,
  SalonSearchFilters,
} from "@/lib/types";

/**
 * Browser-side access to the public catalogue. Server components should
 * import from @/server/services/publicCatalogService instead and skip the
 * HTTP hop entirely.
 */

export async function getSalons(
  filters: SalonSearchFilters = {},
): Promise<PublicSalonSummaryDTO[]> {
  return apiGet<PublicSalonSummaryDTO[]>(
    "/api/public/salons",
    {
      search: filters.query || undefined,
      city: filters.city || undefined,
      category: filters.category || undefined,
      sort: filters.sort || undefined,
    },
    { auth: false },
  );
}

export async function getSalonBySlug(slug: string): Promise<PublicSalonDetailDTO> {
  return apiGet<PublicSalonDetailDTO>(
    `/api/public/salons/${encodeURIComponent(slug)}`,
    undefined,
    { auth: false },
  );
}

export async function getPublicFilters(): Promise<PublicFiltersDTO> {
  return apiGet<PublicFiltersDTO>("/api/public/filters", undefined, { auth: false });
}

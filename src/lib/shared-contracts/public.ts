import type { SalonCategory } from "./salon-category";
import type { WeeklyHours } from "./working-hours";

/**
 * Shapes served by the public (unauthenticated) discovery endpoints under
 * /api/public. These deliberately expose only what a visitor needs to browse
 * and contact a salon — no owner ids, verification state, or internal flags.
 *
 * Every field here maps to something a salon owner actually entered. There is
 * no ratings/reviews collection in the data model, so the public site shows
 * none rather than inventing them.
 */

export interface PublicServiceDTO {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  priceLkr: number;
  discountedPriceLkr: number | null;
}

export interface PublicStaffDTO {
  id: string;
  fullName: string;
  jobTitle: string;
  bio: string | null;
  photoUrl: string | null;
}

/** A salon as it appears in listings (home page, search results). */
export interface PublicSalonSummaryDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SalonCategory;
  city: string;
  district: string;
  address: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  serviceCount: number;
  /** Cheapest active service price, or null when the salon has no services yet. */
  fromPriceLkr: number | null;
}

/** Everything the salon detail page renders. */
export interface PublicSalonDetailDTO extends PublicSalonSummaryDTO {
  businessPhone: string;
  businessEmail: string;
  whatsappNumber: string | null;
  googleMapsUrl: string | null;
  galleryUrls: string[];
  facilities: string[];
  languages: string[];
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    website: string | null;
  };
  bookingInstructions: string | null;
  cancellationPolicy: string | null;
  weeklyHours: WeeklyHours;
  services: PublicServiceDTO[];
  staff: PublicStaffDTO[];
}

/** Facet values actually present across live salons, for the search filters. */
export interface PublicFiltersDTO {
  cities: string[];
  categories: SalonCategory[];
}

export type PublicSalonSort = "name" | "price-low" | "price-high";

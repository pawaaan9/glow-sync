/**
 * Salon categories are data, not a fixed enum: a platform (super) admin
 * manages them from /platform-admin/categories and they are stored in the
 * `salonCategories` collection, which starts empty. The constants below are
 * only a source of icons and fallback display labels for well-known slugs
 * (including legacy ones) — they are never seeded into the collection.
 *
 * `SalonCategory` is just a slug string; validate a value against the live
 * collection server-side rather than against a compile-time union.
 */

export const SALON_CATEGORIES = {
  HAIR_SALON: "hair_salon",
  BEAUTY_SALON: "beauty_salon",
  BARBERSHOP: "barbershop",
  NAIL_SALON: "nail_salon",
  BRIDAL_MAKEUP_STUDIO: "bridal_makeup_studio",
  SPA: "spa",
  WELLNESS_CENTRE: "wellness_centre",
  FREELANCE_BEAUTY_PROFESSIONAL: "freelance_beauty_professional",
} as const;

/** A category slug. Any lowercase snake_case string a super admin has defined. */
export type SalonCategory = string;

export const ALL_SALON_CATEGORIES: string[] = Object.values(SALON_CATEGORIES);

export const SALON_CATEGORY_LABELS: Record<string, string> = {
  [SALON_CATEGORIES.HAIR_SALON]: "Hair Salon",
  [SALON_CATEGORIES.BEAUTY_SALON]: "Beauty Salon",
  [SALON_CATEGORIES.BARBERSHOP]: "Barbershop",
  [SALON_CATEGORIES.NAIL_SALON]: "Nail Salon",
  [SALON_CATEGORIES.BRIDAL_MAKEUP_STUDIO]: "Bridal & Makeup Studio",
  [SALON_CATEGORIES.SPA]: "Spa",
  [SALON_CATEGORIES.WELLNESS_CENTRE]: "Wellness Centre",
  [SALON_CATEGORIES.FREELANCE_BEAUTY_PROFESSIONAL]: "Freelance Beauty Professional",
};

/**
 * Human label for a category slug. Prefers an explicit map (a caller's
 * fetched list, keyed slug -> label), then the built-in labels, then a
 * title-cased fallback so a freshly-added custom category never renders as
 * a raw slug.
 */
export function salonCategoryLabel(
  slug: string | null | undefined,
  overrides?: Record<string, string>,
): string {
  if (!slug) return "";
  return (
    overrides?.[slug] ??
    SALON_CATEGORY_LABELS[slug] ??
    slug
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/** A managed salon category, as served by the API. */
export interface SalonCategoryDTO {
  id: string;
  slug: string;
  label: string;
  /** Inactive categories stay valid for existing salons but are hidden from registration. */
  isActive: boolean;
  sortOrder: number;
  /** Number of salons currently using this category. */
  salonCount: number;
  createdAt: string;
  updatedAt: string;
}

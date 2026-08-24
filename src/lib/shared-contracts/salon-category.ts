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

export type SalonCategory = (typeof SALON_CATEGORIES)[keyof typeof SALON_CATEGORIES];

export const ALL_SALON_CATEGORIES: SalonCategory[] = Object.values(SALON_CATEGORIES);

export const SALON_CATEGORY_LABELS: Record<SalonCategory, string> = {
  [SALON_CATEGORIES.HAIR_SALON]: "Hair Salon",
  [SALON_CATEGORIES.BEAUTY_SALON]: "Beauty Salon",
  [SALON_CATEGORIES.BARBERSHOP]: "Barbershop",
  [SALON_CATEGORIES.NAIL_SALON]: "Nail Salon",
  [SALON_CATEGORIES.BRIDAL_MAKEUP_STUDIO]: "Bridal & Makeup Studio",
  [SALON_CATEGORIES.SPA]: "Spa",
  [SALON_CATEGORIES.WELLNESS_CENTRE]: "Wellness Centre",
  [SALON_CATEGORIES.FREELANCE_BEAUTY_PROFESSIONAL]: "Freelance Beauty Professional",
};

import { salons as mockSalons } from "@/lib/mock-data";
import type { Salon, SalonSearchFilters } from "@/lib/types";
import { computeSalonPriceFrom } from "@/lib/mock-data";
import { ApiError, mockDelay } from "./client";

export async function getSalons(filters: SalonSearchFilters = {}): Promise<Salon[]> {
  let results = [...mockSalons];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q)) ||
        s.services.some((sv) => sv.name.toLowerCase().includes(q)),
    );
  }

  if (filters.city) {
    results = results.filter(
      (s) => s.city.toLowerCase() === filters.city!.toLowerCase(),
    );
  }

  if (filters.category) {
    results = results.filter((s) => s.categories.includes(filters.category!));
  }

  if (filters.minRating) {
    results = results.filter((s) => s.rating >= filters.minRating!);
  }

  if (filters.priceLevel) {
    results = results.filter((s) => s.priceLevel === filters.priceLevel);
  }

  switch (filters.sort) {
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "price-low":
      results.sort((a, b) => computeSalonPriceFrom(a) - computeSalonPriceFrom(b));
      break;
    case "price-high":
      results.sort((a, b) => computeSalonPriceFrom(b) - computeSalonPriceFrom(a));
      break;
    default:
      results.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }

  return mockDelay(results);
}

export async function getFeaturedSalons(): Promise<Salon[]> {
  return mockDelay(mockSalons.filter((s) => s.featured));
}

export async function getSalonBySlug(slug: string): Promise<Salon> {
  const salon = mockSalons.find((s) => s.slug === slug);
  if (!salon) throw new ApiError(`Salon "${slug}" not found`, 404);
  return mockDelay(salon);
}

export async function getCities(): Promise<string[]> {
  return mockDelay(Array.from(new Set(mockSalons.map((s) => s.city))));
}

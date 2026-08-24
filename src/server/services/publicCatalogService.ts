import { db } from "@/server/config/firebase";
import {
  COLLECTIONS,
  SALON_STATUS,
  SALON_SUBCOLLECTIONS,
  defaultWeeklyHours,
  type PublicFiltersDTO,
  type PublicSalonDetailDTO,
  type PublicSalonSort,
  type PublicSalonSummaryDTO,
  type PublicServiceDTO,
  type PublicStaffDTO,
  type SalonCategory,
} from "@/lib/shared";
import { ApiError } from "@/server/lib/apiError";
import type { SalonDocument, ServiceDocument, StaffDocument } from "@/server/types/firestore";

/**
 * Read-only catalogue for the public site. Only ACTIVE salons are ever
 * visible — pending, rejected, and suspended salons must not leak to
 * visitors — and only active services / bookable staff are listed.
 */

function activeSalonsQuery() {
  return db.collection(COLLECTIONS.SALONS).where("status", "==", SALON_STATUS.ACTIVE);
}

async function loadActiveServices(salonId: string): Promise<ServiceDocument[]> {
  const snap = await db
    .collection(COLLECTIONS.SALONS)
    .doc(salonId)
    .collection(SALON_SUBCOLLECTIONS.SERVICES)
    .where("isActive", "==", true)
    .get();
  return snap.docs.map((d) => ({ ...(d.data() as ServiceDocument), id: d.id }));
}

/** Price a customer would actually pay, so "from" reflects any discount. */
function effectivePrice(service: ServiceDocument) {
  return service.discountedPriceLkr ?? service.priceLkr;
}

function toSummary(
  salon: SalonDocument,
  services: ServiceDocument[],
): PublicSalonSummaryDTO {
  const prices = services.map(effectivePrice);
  return {
    id: salon.id,
    slug: salon.slug,
    name: salon.name,
    description: salon.description,
    category: salon.category,
    city: salon.city,
    district: salon.district,
    address: salon.address,
    logoUrl: salon.logoUrl,
    coverImageUrl: salon.coverImageUrl ?? null,
    serviceCount: services.length,
    fromPriceLkr: prices.length ? Math.min(...prices) : null,
  };
}

function toPublicService(doc: ServiceDocument): PublicServiceDTO {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    durationMinutes: doc.durationMinutes,
    priceLkr: doc.priceLkr,
    discountedPriceLkr: doc.discountedPriceLkr,
  };
}

function toPublicStaff(doc: StaffDocument): PublicStaffDTO {
  return {
    id: doc.id,
    fullName: doc.fullName,
    jobTitle: doc.jobTitle,
    bio: doc.bio,
    photoUrl: doc.photoUrl,
  };
}

export interface PublicSalonsQuery {
  search?: string;
  city?: string;
  category?: SalonCategory;
  sort?: PublicSalonSort;
}

export async function listPublicSalons(
  query: PublicSalonsQuery = {},
): Promise<PublicSalonSummaryDTO[]> {
  let base: FirebaseFirestore.Query = activeSalonsQuery();
  if (query.city) base = base.where("city", "==", query.city);
  if (query.category) base = base.where("category", "==", query.category);

  const snap = await base.get();
  const salons = snap.docs.map((d) => ({ ...(d.data() as SalonDocument), id: d.id }));

  const summaries = await Promise.all(
    salons.map(async (salon) => toSummary(salon, await loadActiveServices(salon.id))),
  );

  const needle = query.search?.trim().toLowerCase();
  const filtered = needle
    ? summaries.filter(
        (s) =>
          s.name.toLowerCase().includes(needle) ||
          s.city.toLowerCase().includes(needle) ||
          s.description.toLowerCase().includes(needle),
      )
    : summaries;

  // Salons with no services yet sort last on price — they have nothing to compare.
  const byPrice = (a: PublicSalonSummaryDTO, b: PublicSalonSummaryDTO, dir: 1 | -1) => {
    if (a.fromPriceLkr === null) return 1;
    if (b.fromPriceLkr === null) return -1;
    return (a.fromPriceLkr - b.fromPriceLkr) * dir;
  };

  switch (query.sort) {
    case "price-low":
      return filtered.sort((a, b) => byPrice(a, b, 1));
    case "price-high":
      return filtered.sort((a, b) => byPrice(a, b, -1));
    default:
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function getPublicSalonBySlug(slug: string): Promise<PublicSalonDetailDTO> {
  const snap = await activeSalonsQuery().where("slug", "==", slug).limit(1).get();
  if (snap.empty) throw ApiError.notFound("Salon not found");

  const doc = snap.docs[0]!;
  const salon = { ...(doc.data() as SalonDocument), id: doc.id };

  const [services, staffSnap] = await Promise.all([
    loadActiveServices(salon.id),
    db
      .collection(COLLECTIONS.SALONS)
      .doc(salon.id)
      .collection(SALON_SUBCOLLECTIONS.STAFF)
      .where("isActive", "==", true)
      .get(),
  ]);

  const staff = staffSnap.docs
    .map((d) => ({ ...(d.data() as StaffDocument), id: d.id }))
    .filter((s) => s.canAcceptBookings);

  return {
    ...toSummary(salon, services),
    businessPhone: salon.businessPhone,
    businessEmail: salon.businessEmail,
    whatsappNumber: salon.whatsappNumber ?? null,
    googleMapsUrl: salon.googleMapsUrl ?? null,
    galleryUrls: salon.galleryUrls ?? [],
    facilities: salon.facilities ?? [],
    languages: salon.languages ?? [],
    socialLinks: salon.socialLinks ?? {
      instagram: null,
      facebook: null,
      tiktok: null,
      website: null,
    },
    bookingInstructions: salon.bookingInstructions ?? null,
    cancellationPolicy: salon.cancellationPolicy ?? null,
    weeklyHours: salon.weeklyHours ?? defaultWeeklyHours(),
    services: services
      .sort((a, b) => effectivePrice(a) - effectivePrice(b))
      .map(toPublicService),
    staff: staff.map(toPublicStaff),
  };
}

/** Only facets that actually match a live salon, so no filter yields zero results. */
export async function getPublicFilters(): Promise<PublicFiltersDTO> {
  const snap = await activeSalonsQuery().get();
  const salons = snap.docs.map((d) => d.data() as SalonDocument);

  return {
    cities: Array.from(new Set(salons.map((s) => s.city))).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(new Set(salons.map((s) => s.category))).sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}

/**
 * Front-end view types. The salon/service shapes come straight from the
 * public API contracts so the UI can only render fields that a salon owner
 * actually entered — there is no local "Salon" shape to drift from them.
 */
export type {
  PublicFiltersDTO,
  PublicSalonDetailDTO,
  PublicSalonSummaryDTO,
  PublicSalonSort,
  PublicServiceDTO,
  PublicStaffDTO,
} from "@/lib/shared";

export type UserRole = "customer" | "salon-owner" | "staff" | "platform-admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface SalonSearchFilters {
  query?: string;
  city?: string;
  category?: string;
  sort?: "name" | "price-low" | "price-high";
}

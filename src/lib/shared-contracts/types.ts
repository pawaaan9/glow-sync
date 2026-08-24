import type { Role } from "./roles";
import type { VerificationStatus } from "./verification-status";
import type { SalonStatus } from "./salon-status";
import type { SalonCategory } from "./salon-category";
import type { NotificationType } from "./notifications";
import type { AuditAction, VerificationHistoryAction } from "./audit";
import type { BookingSource, BookingStatus } from "./booking-status";
import type { SalonClosure, SpecialDayHours, WeeklyHours } from "./working-hours";

/**
 * Wire-format DTOs: what crosses the HTTP boundary between the backend and
 * the frontend (dates as ISO 8601 strings, no Firestore Timestamp/FieldValue
 * types). The backend's internal Firestore document types are a superset of
 * these with real Timestamp fields, defined backend-side.
 */

export interface UserDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  salonId: string | null;
  verificationStatus: VerificationStatus | null;
  rejectionReason: string | null;
  suspendedReason: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export interface SalonSocialLinks {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  website: string | null;
}

export interface SalonBookingSettings {
  /** Minimum minutes of notice required before a booking's start time. */
  noticePeriodMinutes: number;
  /** How many days out a customer may book in advance. */
  maxAdvanceDays: number;
  /** Calendar slot granularity in minutes. */
  slotIntervalMinutes: number;
  /** Hours before the appointment a customer may still cancel penalty-free. */
  cancellationWindowHours: number;
}

export interface SalonDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  businessPhone: string;
  businessEmail: string;
  whatsappNumber: string | null;
  address: string;
  city: string;
  district: string;
  googleMapsUrl: string | null;
  businessRegistrationNumber: string | null;
  description: string;
  category: SalonCategory;
  numberOfStaff: number;
  logoUrl: string | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
  facilities: string[];
  languages: string[];
  socialLinks: SalonSocialLinks;
  bookingInstructions: string | null;
  cancellationPolicy: string | null;
  depositPolicy: string | null;
  weeklyHours: WeeklyHours;
  specialHours: SpecialDayHours[];
  closures: SalonClosure[];
  bookingSettings: SalonBookingSettings;
  hasVerificationDocument: boolean;
  status: SalonStatus;
  rejectionReason: string | null;
  suspendedReason: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  /** Populated only by platform-admin list/detail endpoints (batch-joined from the owner's user doc). */
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface SalonVerificationHistoryDTO {
  id: string;
  salonId: string;
  ownerId: string;
  previousStatus: string | null;
  newStatus: string;
  action: VerificationHistoryAction;
  reason: string | null;
  performedBy: string;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  action: AuditAction;
  actorId: string;
  actorRole: Role;
  targetUserId: string | null;
  targetSalonId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  recipientId: string | null;
  recipientRole: Role | null;
  title: string;
  message: string;
  type: NotificationType;
  relatedSalonId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /api/auth/me — drives frontend routing decisions. */
export interface MeResponse {
  user: UserDTO;
  salon: SalonDTO | null;
}

export interface PlatformAdminDashboardDTO {
  counts: {
    pendingApplications: number;
    approvedSalons: number;
    rejectedApplications: number;
    suspendedSalons: number;
    totalSalonOwners: number;
    applicationsThisMonth: number;
  };
  recentApplications: SalonDTO[];
  recentActivity: AuditLogDTO[];
}

/* ------------------------------------------------------------------ */
/* Salon-owner panel: services, staff, customers, bookings, time off. */
/* ------------------------------------------------------------------ */

export interface ServiceDTO {
  id: string;
  salonId: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  priceLkr: number;
  discountedPriceLkr: number | null;
  depositLkr: number | null;
  assignedStaffIds: string[];
  isActive: boolean;
  /** True once at least one booking has referenced this service — blocks hard deletion. */
  hasBookingHistory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffBreak {
  start: string;
  end: string;
}

export interface StaffDayAvailability {
  isWorking: boolean;
  start: string;
  end: string;
  breaks: StaffBreak[];
}

export type StaffWeeklyAvailability = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  StaffDayAvailability
>;

export interface StaffDTO {
  id: string;
  salonId: string;
  fullName: string;
  phone: string;
  email: string | null;
  photoUrl: string | null;
  jobTitle: string;
  bio: string | null;
  assignedServiceIds: string[];
  weeklyAvailability: StaffWeeklyAvailability;
  isActive: boolean;
  canAcceptBookings: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDTO {
  id: string;
  salonId: string;
  fullName: string;
  phone: string;
  email: string | null;
  lastVisitAt: string | null;
  nextBookingAt: string | null;
  totalAppointments: number;
  totalSpendLkr: number;
  cancellationCount: number;
  noShowCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingHistoryEntryDTO {
  status: BookingStatus;
  changedAt: string;
  changedBy: string;
  note: string | null;
}

export interface BookingDTO {
  id: string;
  salonId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceId: string;
  /** Snapshot at booking time — never mutated afterward, even if the service later changes. */
  serviceName: string;
  serviceDurationMinutes: number;
  servicePriceLkr: number;
  staffId: string | null;
  /** Snapshot at assignment time. */
  staffName: string | null;
  status: BookingStatus;
  source: BookingSource;
  startAt: string;
  endAt: string;
  internalNotes: string | null;
  declineReason: string | null;
  cancellationReason: string | null;
  history: BookingHistoryEntryDTO[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TimeOffDTO {
  id: string;
  salonId: string;
  /** null = whole-salon blocked time; set = one staff member's leave. */
  staffId: string | null;
  startAt: string;
  endAt: string;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface SalonOwnerDashboardDTO {
  counts: {
    todayBookings: number;
    pendingRequests: number;
    awaitingStaffAcceptance: number;
    confirmed: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
    activeStaff: number;
    activeServices: number;
  };
  revenue: {
    todayLkr: number;
    monthLkr: number;
  };
  upcomingAppointments: BookingDTO[];
  recentActivity: AuditLogDTO[];
}

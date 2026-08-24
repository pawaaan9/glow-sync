import type { Timestamp, FieldValue } from "firebase-admin/firestore";
import type {
  Role,
  VerificationStatus,
  SalonStatus,
  SalonCategory,
  NotificationType,
  AuditAction,
  VerificationHistoryAction,
  BookingStatus,
  BookingSource,
  SalonSocialLinks,
  SalonBookingSettings,
  WeeklyHours,
  SpecialDayHours,
  SalonClosure,
  StaffWeeklyAvailability,
} from "@/lib/shared";

type TimestampField = Timestamp | FieldValue;

/** Internal Firestore document shapes (real Timestamp/FieldValue types). */

export interface UserDocument {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  salonId: string | null;
  verificationStatus: VerificationStatus | null;
  rejectionReason: string | null;
  suspendedReason: string | null;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  verifiedAt: TimestampField | null;
  verifiedBy: string | null;
}

/**
 * Platform (super) admin documents in superAdmins/. Deliberately much
 * narrower than UserDocument: an admin has no phone, no salon, and never
 * goes through the verification lifecycle, so those columns would only
 * ever hold nulls. getAccountDoc() widens this to a UserDocument for the
 * call sites that read accounts generically.
 */
export interface SuperAdminDocument {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: TimestampField;
  updatedAt: TimestampField;
}

export interface SalonDocument {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  businessPhone: string;
  businessEmail: string;
  /** Optional profile fields, absent on documents created before the salon-owner panel shipped. */
  whatsappNumber?: string | null;
  address: string;
  city: string;
  district: string;
  googleMapsUrl?: string | null;
  businessRegistrationNumber: string | null;
  description: string;
  category: SalonCategory;
  numberOfStaff: number;
  logoUrl: string | null;
  coverImageUrl?: string | null;
  galleryUrls?: string[];
  facilities?: string[];
  languages?: string[];
  socialLinks?: SalonSocialLinks;
  bookingInstructions?: string | null;
  cancellationPolicy?: string | null;
  depositPolicy?: string | null;
  weeklyHours?: WeeklyHours;
  specialHours?: SpecialDayHours[];
  closures?: SalonClosure[];
  bookingSettings?: SalonBookingSettings;
  verificationDocumentPath: string | null;
  status: SalonStatus;
  rejectionReason: string | null;
  suspendedReason: string | null;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  approvedAt: TimestampField | null;
  approvedBy: string | null;
}

export interface SalonVerificationHistoryDocument {
  id: string;
  salonId: string;
  ownerId: string;
  previousStatus: string | null;
  newStatus: string;
  action: VerificationHistoryAction;
  reason: string | null;
  performedBy: string;
  createdAt: TimestampField;
}

export interface AuditLogDocument {
  id: string;
  action: AuditAction;
  actorId: string;
  actorRole: Role;
  targetUserId: string | null;
  targetSalonId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: TimestampField;
}

export interface NotificationDocument {
  id: string;
  recipientId: string | null;
  recipientRole: Role | null;
  title: string;
  message: string;
  type: NotificationType;
  relatedSalonId: string | null;
  isRead: boolean;
  createdAt: TimestampField;
}

/* ------------------------------------------------------------------ */
/* Salon-owner panel: salons/{salonId}/{services,staff,customers,timeOff} */
/* and top-level bookings/{bookingId}.                                  */
/* ------------------------------------------------------------------ */

export interface ServiceDocument {
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
  hasBookingHistory: boolean;
  createdAt: TimestampField;
  updatedAt: TimestampField;
}

export interface StaffDocument {
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
  createdAt: TimestampField;
  updatedAt: TimestampField;
}

export interface CustomerDocument {
  id: string;
  salonId: string;
  fullName: string;
  phone: string;
  email: string | null;
  lastVisitAt: TimestampField | null;
  nextBookingAt: TimestampField | null;
  totalAppointments: number;
  totalSpendLkr: number;
  cancellationCount: number;
  noShowCount: number;
  notes: string | null;
  createdAt: TimestampField;
  updatedAt: TimestampField;
}

export interface BookingHistoryEntry {
  status: BookingStatus;
  changedAt: TimestampField;
  changedBy: string;
  note: string | null;
}

export interface BookingDocument {
  id: string;
  salonId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  servicePriceLkr: number;
  staffId: string | null;
  staffName: string | null;
  status: BookingStatus;
  source: BookingSource;
  startAt: TimestampField;
  endAt: TimestampField;
  internalNotes: string | null;
  declineReason: string | null;
  cancellationReason: string | null;
  history: BookingHistoryEntry[];
  createdAt: TimestampField;
  updatedAt: TimestampField;
  createdBy: string;
}

export interface TimeOffDocument {
  id: string;
  salonId: string;
  staffId: string | null;
  startAt: TimestampField;
  endAt: TimestampField;
  reason: string;
  createdAt: TimestampField;
  createdBy: string;
}

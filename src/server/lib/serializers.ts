import type { Timestamp, FieldValue } from "firebase-admin/firestore";
import { defaultWeeklyHours } from "@/lib/shared";
import type {
  UserDTO,
  SalonDTO,
  SalonCategoryDTO,
  SalonVerificationHistoryDTO,
  AuditLogDTO,
  NotificationDTO,
  ServiceDTO,
  StaffDTO,
  CustomerDTO,
  BookingDTO,
  TimeOffDTO,
} from "@/lib/shared";
import type {
  UserDocument,
  SalonDocument,
  SalonCategoryDocument,
  SalonVerificationHistoryDocument,
  AuditLogDocument,
  NotificationDocument,
  ServiceDocument,
  StaffDocument,
  CustomerDocument,
  BookingDocument,
  TimeOffDocument,
} from "@/server/types/firestore";

/**
 * Converts a Firestore Timestamp (or a still-pending server-timestamp
 * sentinel written moments ago) to an ISO string for the wire format.
 * Freshly-written docs re-read inside the same request occasionally still
 * carry the FieldValue sentinel rather than a resolved Timestamp; falling
 * back to "now" keeps serialization total instead of throwing.
 */
function toIso(value: Timestamp | FieldValue | null | undefined): string | null {
  if (!value) return null;
  if (typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function toIsoRequired(value: Timestamp | FieldValue | null | undefined): string {
  return toIso(value) ?? new Date().toISOString();
}

export function serializeUser(doc: UserDocument): UserDTO {
  return {
    id: doc.id,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    salonId: doc.salonId,
    verificationStatus: doc.verificationStatus,
    rejectionReason: doc.rejectionReason,
    suspendedReason: doc.suspendedReason,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
    verifiedAt: toIso(doc.verifiedAt),
    verifiedBy: doc.verifiedBy,
  };
}

/** salons/{salonId} documents created before the owner panel shipped are missing these — default them. */
export function serializeSalon(doc: SalonDocument): SalonDTO {
  return {
    id: doc.id,
    ownerId: doc.ownerId,
    name: doc.name,
    slug: doc.slug,
    businessPhone: doc.businessPhone,
    businessEmail: doc.businessEmail,
    whatsappNumber: doc.whatsappNumber ?? null,
    address: doc.address,
    city: doc.city,
    district: doc.district,
    googleMapsUrl: doc.googleMapsUrl ?? null,
    businessRegistrationNumber: doc.businessRegistrationNumber,
    description: doc.description,
    category: doc.category,
    numberOfStaff: doc.numberOfStaff,
    logoUrl: doc.logoUrl,
    coverImageUrl: doc.coverImageUrl ?? null,
    galleryUrls: doc.galleryUrls ?? [],
    facilities: doc.facilities ?? [],
    languages: doc.languages ?? [],
    socialLinks: doc.socialLinks ?? { instagram: null, facebook: null, tiktok: null, website: null },
    bookingInstructions: doc.bookingInstructions ?? null,
    cancellationPolicy: doc.cancellationPolicy ?? null,
    depositPolicy: doc.depositPolicy ?? null,
    weeklyHours: doc.weeklyHours ?? defaultWeeklyHours(),
    specialHours: doc.specialHours ?? [],
    closures: doc.closures ?? [],
    bookingSettings: doc.bookingSettings ?? {
      noticePeriodMinutes: 60,
      maxAdvanceDays: 30,
      slotIntervalMinutes: 15,
      cancellationWindowHours: 12,
    },
    hasVerificationDocument: Boolean(doc.verificationDocumentPath),
    status: doc.status,
    rejectionReason: doc.rejectionReason,
    suspendedReason: doc.suspendedReason,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
    approvedAt: toIso(doc.approvedAt),
    approvedBy: doc.approvedBy,
  };
}

export function serializeSalonCategory(
  doc: SalonCategoryDocument,
  salonCount = 0,
): SalonCategoryDTO {
  return {
    id: doc.id,
    slug: doc.slug,
    label: doc.label,
    isActive: doc.isActive,
    sortOrder: doc.sortOrder,
    salonCount,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
  };
}

export function serializeVerificationHistory(
  doc: SalonVerificationHistoryDocument,
): SalonVerificationHistoryDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    ownerId: doc.ownerId,
    previousStatus: doc.previousStatus,
    newStatus: doc.newStatus,
    action: doc.action,
    reason: doc.reason,
    performedBy: doc.performedBy,
    createdAt: toIsoRequired(doc.createdAt),
  };
}

export function serializeAuditLog(doc: AuditLogDocument): AuditLogDTO {
  return {
    id: doc.id,
    action: doc.action,
    actorId: doc.actorId,
    actorRole: doc.actorRole,
    targetUserId: doc.targetUserId,
    targetSalonId: doc.targetSalonId,
    metadata: doc.metadata,
    createdAt: toIsoRequired(doc.createdAt),
  };
}

export function serializeNotification(doc: NotificationDocument): NotificationDTO {
  return {
    id: doc.id,
    recipientId: doc.recipientId,
    recipientRole: doc.recipientRole,
    title: doc.title,
    message: doc.message,
    type: doc.type,
    relatedSalonId: doc.relatedSalonId,
    isRead: doc.isRead,
    createdAt: toIsoRequired(doc.createdAt),
  };
}

export function serializeService(doc: ServiceDocument): ServiceDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    name: doc.name,
    category: doc.category,
    description: doc.description,
    durationMinutes: doc.durationMinutes,
    priceLkr: doc.priceLkr,
    discountedPriceLkr: doc.discountedPriceLkr,
    depositLkr: doc.depositLkr,
    assignedStaffIds: doc.assignedStaffIds,
    isActive: doc.isActive,
    hasBookingHistory: doc.hasBookingHistory,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
  };
}

export function serializeStaff(doc: StaffDocument): StaffDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    fullName: doc.fullName,
    phone: doc.phone,
    email: doc.email,
    photoUrl: doc.photoUrl,
    jobTitle: doc.jobTitle,
    bio: doc.bio,
    assignedServiceIds: doc.assignedServiceIds,
    weeklyAvailability: doc.weeklyAvailability,
    isActive: doc.isActive,
    canAcceptBookings: doc.canAcceptBookings,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
  };
}

export function serializeCustomer(doc: CustomerDocument): CustomerDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    fullName: doc.fullName,
    phone: doc.phone,
    email: doc.email,
    lastVisitAt: toIso(doc.lastVisitAt),
    nextBookingAt: toIso(doc.nextBookingAt),
    totalAppointments: doc.totalAppointments,
    totalSpendLkr: doc.totalSpendLkr,
    cancellationCount: doc.cancellationCount,
    noShowCount: doc.noShowCount,
    notes: doc.notes,
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
  };
}

export function serializeBooking(doc: BookingDocument): BookingDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    customerId: doc.customerId,
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    customerEmail: doc.customerEmail,
    serviceId: doc.serviceId,
    serviceName: doc.serviceName,
    serviceDurationMinutes: doc.serviceDurationMinutes,
    servicePriceLkr: doc.servicePriceLkr,
    staffId: doc.staffId,
    staffName: doc.staffName,
    status: doc.status,
    source: doc.source,
    startAt: toIsoRequired(doc.startAt),
    endAt: toIsoRequired(doc.endAt),
    internalNotes: doc.internalNotes,
    declineReason: doc.declineReason,
    cancellationReason: doc.cancellationReason,
    history: doc.history.map((h) => ({
      status: h.status,
      changedAt: toIsoRequired(h.changedAt),
      changedBy: h.changedBy,
      note: h.note,
    })),
    createdAt: toIsoRequired(doc.createdAt),
    updatedAt: toIsoRequired(doc.updatedAt),
    createdBy: doc.createdBy,
  };
}

export function serializeTimeOff(doc: TimeOffDocument): TimeOffDTO {
  return {
    id: doc.id,
    salonId: doc.salonId,
    staffId: doc.staffId,
    startAt: toIsoRequired(doc.startAt),
    endAt: toIsoRequired(doc.endAt),
    reason: doc.reason,
    createdAt: toIsoRequired(doc.createdAt),
    createdBy: doc.createdBy,
  };
}

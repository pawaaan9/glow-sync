import type { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { UserDTO, SalonDTO, SalonVerificationHistoryDTO, AuditLogDTO, NotificationDTO } from "@/lib/shared";
import type {
  UserDocument,
  SalonDocument,
  SalonVerificationHistoryDocument,
  AuditLogDocument,
  NotificationDocument,
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

export function serializeSalon(doc: SalonDocument): SalonDTO {
  return {
    id: doc.id,
    ownerId: doc.ownerId,
    name: doc.name,
    slug: doc.slug,
    businessPhone: doc.businessPhone,
    businessEmail: doc.businessEmail,
    address: doc.address,
    city: doc.city,
    district: doc.district,
    businessRegistrationNumber: doc.businessRegistrationNumber,
    description: doc.description,
    category: doc.category,
    numberOfStaff: doc.numberOfStaff,
    logoUrl: doc.logoUrl,
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

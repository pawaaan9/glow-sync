import type { Timestamp, FieldValue } from "firebase-admin/firestore";
import type {
  Role,
  VerificationStatus,
  SalonStatus,
  SalonCategory,
  NotificationType,
  AuditAction,
  VerificationHistoryAction,
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
  address: string;
  city: string;
  district: string;
  businessRegistrationNumber: string | null;
  description: string;
  category: SalonCategory;
  numberOfStaff: number;
  logoUrl: string | null;
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

import type { Role } from "./roles";
import type { VerificationStatus } from "./verification-status";
import type { SalonStatus } from "./salon-status";
import type { SalonCategory } from "./salon-category";
import type { NotificationType } from "./notifications";
import type { AuditAction, VerificationHistoryAction } from "./audit";

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

export interface SalonDTO {
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

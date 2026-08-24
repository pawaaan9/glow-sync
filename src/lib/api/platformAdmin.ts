import { apiGet, apiPatch } from "@/lib/api/http";
import type {
  AuditLogDTO,
  PaginatedResult,
  PlatformAdminDashboardDTO,
  SalonDTO,
  SalonsQuery,
  SalonVerificationHistoryDTO,
  UserDTO,
} from "@/lib/shared";

export function getPlatformAdminDashboard() {
  return apiGet<PlatformAdminDashboardDTO>("/api/platform-admin/dashboard");
}

export interface SalonApplicationDetail {
  salon: SalonDTO;
  owner: UserDTO | null;
  history: SalonVerificationHistoryDTO[];
}

export function listSalonApplications(query: Partial<SalonsQuery> = {}) {
  return apiGet<PaginatedResult<SalonDTO>>(
    "/api/platform-admin/salon-applications",
    query as Record<string, string | number | undefined>,
  );
}

export function getSalonApplication(salonId: string) {
  return apiGet<SalonApplicationDetail>(`/api/platform-admin/salon-applications/${salonId}`);
}

export function getVerificationDocumentDownloadUrl(salonId: string) {
  return apiGet<{ url: string }>(
    `/api/platform-admin/salon-applications/${salonId}/verification-document/download`,
  );
}

export function approveSalonApplication(salonId: string) {
  return apiPatch(`/api/platform-admin/salon-applications/${salonId}/approve`);
}

export function rejectSalonApplication(salonId: string, reason: string) {
  return apiPatch(`/api/platform-admin/salon-applications/${salonId}/reject`, { reason });
}

export function listSalons(query: Partial<SalonsQuery> = {}) {
  return apiGet<PaginatedResult<SalonDTO>>(
    "/api/platform-admin/salons",
    query as Record<string, string | number | undefined>,
  );
}

export function suspendSalon(salonId: string, reason: string) {
  return apiPatch(`/api/platform-admin/salons/${salonId}/suspend`, { reason });
}

export function reactivateSalon(salonId: string) {
  return apiPatch(`/api/platform-admin/salons/${salonId}/reactivate`);
}

export function listSalonOwners(query: Record<string, string | number | undefined> = {}) {
  return apiGet<PaginatedResult<UserDTO>>("/api/platform-admin/salon-owners", query);
}

export function listAuditLogs(query: Record<string, string | number | undefined> = {}) {
  return apiGet<PaginatedResult<AuditLogDTO>>("/api/platform-admin/audit-logs", query);
}

export function listVerificationHistory(query: Record<string, string | number | undefined> = {}) {
  return apiGet<PaginatedResult<SalonVerificationHistoryDTO>>(
    "/api/platform-admin/verification-history",
    query,
  );
}

import { apiGet, apiPatch } from "@/lib/api/http";
import type { NotificationDTO, PaginatedResult } from "@/lib/shared";

export function listMyNotifications(query: Record<string, string | number | undefined> = {}) {
  return apiGet<PaginatedResult<NotificationDTO>>("/api/platform-admin/notifications", query);
}

export function markNotificationRead(notificationId: string) {
  return apiPatch(`/api/platform-admin/notifications/${notificationId}/read`);
}

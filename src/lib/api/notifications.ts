import { apiGet, apiPatch } from "@/lib/api/http";
import type { NotificationDTO, PaginatedResult } from "@/lib/shared";

/** Both platform-admin and salon-owner expose the same notifications shape at their own base path. */
export function listMyNotifications(
  basePath: string,
  query: Record<string, string | number | undefined> = {},
) {
  return apiGet<PaginatedResult<NotificationDTO>>(`${basePath}/notifications`, query);
}

export function markNotificationRead(basePath: string, notificationId: string) {
  return apiPatch(`${basePath}/notifications/${notificationId}/read`);
}

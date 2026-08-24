import { listMyNotifications, markNotificationRead } from "@/lib/api/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** `basePath` is the caller's API root, e.g. "/api/platform-admin" or "/api/salon-owner". */
export function useMyNotifications(basePath: string) {
  return useQuery({
    queryKey: ["notifications", "mine", basePath],
    queryFn: () => listMyNotifications(basePath, { limit: 10 }),
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead(basePath: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(basePath, notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

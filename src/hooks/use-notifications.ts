import { listMyNotifications, markNotificationRead } from "@/lib/api/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyNotifications() {
  return useQuery({
    queryKey: ["notifications", "mine"],
    queryFn: () => listMyNotifications({ limit: 10 }),
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

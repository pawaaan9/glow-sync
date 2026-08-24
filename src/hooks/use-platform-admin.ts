import {
  approveSalonApplication,
  getPlatformAdminDashboard,
  getSalonApplication,
  listAuditLogs,
  listSalonApplications,
  listSalonOwners,
  listSalons,
  listVerificationHistory,
  rejectSalonApplication,
  reactivateSalon,
  suspendSalon,
} from "@/lib/api/platformAdmin";
import type { SalonsQuery } from "@/lib/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePlatformAdminDashboard() {
  return useQuery({
    queryKey: ["platform-admin", "dashboard"],
    queryFn: getPlatformAdminDashboard,
  });
}

export function useSalonApplications(query: Partial<SalonsQuery>) {
  return useQuery({
    queryKey: ["platform-admin", "salon-applications", query],
    queryFn: () => listSalonApplications(query),
  });
}

export function useSalonApplication(salonId: string) {
  return useQuery({
    queryKey: ["platform-admin", "salon-application", salonId],
    queryFn: () => getSalonApplication(salonId),
    enabled: Boolean(salonId),
  });
}

export function useSalons(query: Partial<SalonsQuery>) {
  return useQuery({
    queryKey: ["platform-admin", "salons", query],
    queryFn: () => listSalons(query),
  });
}

export function useSalonOwners(query: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ["platform-admin", "salon-owners", query],
    queryFn: () => listSalonOwners(query),
  });
}

export function useAuditLogs(query: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ["platform-admin", "audit-logs", query],
    queryFn: () => listAuditLogs(query),
  });
}

export function useVerificationHistory(query: Record<string, string | number | undefined> = {}) {
  return useQuery({
    queryKey: ["platform-admin", "verification-history", query],
    queryFn: () => listVerificationHistory(query),
  });
}

function useInvalidatePlatformAdmin() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["platform-admin"] });
}

export function useApproveSalonApplication() {
  const invalidate = useInvalidatePlatformAdmin();
  return useMutation({
    mutationFn: (salonId: string) => approveSalonApplication(salonId),
    onSuccess: invalidate,
  });
}

export function useRejectSalonApplication() {
  const invalidate = useInvalidatePlatformAdmin();
  return useMutation({
    mutationFn: ({ salonId, reason }: { salonId: string; reason: string }) =>
      rejectSalonApplication(salonId, reason),
    onSuccess: invalidate,
  });
}

export function useSuspendSalon() {
  const invalidate = useInvalidatePlatformAdmin();
  return useMutation({
    mutationFn: ({ salonId, reason }: { salonId: string; reason: string }) =>
      suspendSalon(salonId, reason),
    onSuccess: invalidate,
  });
}

export function useReactivateSalon() {
  const invalidate = useInvalidatePlatformAdmin();
  return useMutation({
    mutationFn: (salonId: string) => reactivateSalon(salonId),
    onSuccess: invalidate,
  });
}

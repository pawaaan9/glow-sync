import { getMyApplication, resubmitApplication } from "@/lib/api/salonOwner";
import type { ResubmitSalonApplicationInput } from "@/lib/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyApplication() {
  return useQuery({
    queryKey: ["salon-owner", "application"],
    queryFn: getMyApplication,
  });
}

export function useResubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResubmitSalonApplicationInput) => resubmitApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-owner"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

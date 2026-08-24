import * as api from "@/lib/api/salonOwner";
import type {
  BookingAssignStaffInput,
  BookingCreateInput,
  BookingNotesInput,
  BookingRescheduleInput,
  BookingsQuery,
  BookingStaffDecisionInput,
  CustomerNotesInput,
  CustomersQuery,
  OwnerProfileInput,
  ResubmitSalonApplicationInput,
  SalonBookingSettingsInput,
  SalonProfileInput,
  ServiceInput,
  ServicePatchInput,
  ServicesQuery,
  StaffInput,
  StaffPatchInput,
  StaffQuery,
  TimeOffCreateInput,
  WorkingHoursUpdateInput,
} from "@/lib/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function useInvalidateSalonOwner() {
  const queryClient = useQueryClient();
  return (extra?: string[]) => {
    queryClient.invalidateQueries({ queryKey: ["salon-owner"] });
    if (extra) for (const key of extra) queryClient.invalidateQueries({ queryKey: [key] });
  };
}

/* Application / onboarding */

export function useMyApplication() {
  return useQuery({ queryKey: ["salon-owner", "application"], queryFn: api.getMyApplication });
}

export function useResubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResubmitSalonApplicationInput) => api.resubmitApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-owner"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

/* Salon profile */

export function useMySalon() {
  return useQuery({ queryKey: ["salon-owner", "salon"], queryFn: api.getMySalon });
}

export function useUpdateSalonProfile() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: SalonProfileInput) => api.updateSalonProfile(input),
    onSuccess: () => invalidate(["auth"]),
  });
}

export function useUpdateBookingSettings() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: SalonBookingSettingsInput) => api.updateBookingSettings(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateWorkingHours() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: WorkingHoursUpdateInput) => api.updateWorkingHours(input),
    onSuccess: () => invalidate(),
  });
}

export function useUploadSalonLogo() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (file: File) => api.uploadSalonLogoActive(file),
    onSuccess: () => invalidate(["auth"]),
  });
}

export function useUploadSalonCover() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (file: File) => api.uploadSalonCover(file),
    onSuccess: () => invalidate(),
  });
}

export function useAddGalleryImage() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (file: File) => api.addGalleryImage(file),
    onSuccess: () => invalidate(),
  });
}

export function useRemoveGalleryImage() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (url: string) => api.removeGalleryImage(url),
    onSuccess: () => invalidate(),
  });
}

/* Time off */

export function useTimeOff() {
  return useQuery({ queryKey: ["salon-owner", "time-off"], queryFn: api.listTimeOff });
}

export function useAddSalonBlockedTime() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: Omit<TimeOffCreateInput, "staffId">) => api.addSalonBlockedTime(input),
    onSuccess: () => invalidate(),
  });
}

export function useRemoveTimeOff() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (timeOffId: string) => api.removeTimeOff(timeOffId),
    onSuccess: () => invalidate(),
  });
}

/* Services */

export function useServices(query: Partial<ServicesQuery> = {}) {
  return useQuery({
    queryKey: ["salon-owner", "services", query],
    queryFn: () => api.listServices(query),
  });
}

export function useService(serviceId: string) {
  return useQuery({
    queryKey: ["salon-owner", "service", serviceId],
    queryFn: () => api.getService(serviceId),
    enabled: Boolean(serviceId),
  });
}

export function useCreateService() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: ServiceInput) => api.createService(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateService() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ serviceId, input }: { serviceId: string; input: ServicePatchInput }) =>
      api.updateService(serviceId, input),
    onSuccess: () => invalidate(),
  });
}

export function useSetServiceActive() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) =>
      api.setServiceActive(serviceId, isActive),
    onSuccess: () => invalidate(),
  });
}

export function useDuplicateService() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (serviceId: string) => api.duplicateService(serviceId),
    onSuccess: () => invalidate(),
  });
}

/* Staff */

export function useStaffList(query: Partial<StaffQuery> = {}) {
  return useQuery({
    queryKey: ["salon-owner", "staff", query],
    queryFn: () => api.listStaff(query),
  });
}

export function useStaffMember(staffId: string) {
  return useQuery({
    queryKey: ["salon-owner", "staff-member", staffId],
    queryFn: () => api.getStaffMember(staffId),
    enabled: Boolean(staffId),
  });
}

export function useCreateStaffMember() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: StaffInput) => api.createStaffMember(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateStaffMember() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ staffId, input }: { staffId: string; input: StaffPatchInput }) =>
      api.updateStaffMember(staffId, input),
    onSuccess: () => invalidate(),
  });
}

export function useSetStaffActive() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ staffId, isActive }: { staffId: string; isActive: boolean }) =>
      api.setStaffActive(staffId, isActive),
    onSuccess: () => invalidate(),
  });
}

export function useUploadStaffPhoto() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ staffId, file }: { staffId: string; file: File }) =>
      api.uploadStaffPhoto(staffId, file),
    onSuccess: () => invalidate(),
  });
}

export function useStaffLeave(staffId: string) {
  return useQuery({
    queryKey: ["salon-owner", "staff-leave", staffId],
    queryFn: () => api.listStaffLeave(staffId),
    enabled: Boolean(staffId),
  });
}

export function useAddStaffLeave() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ staffId, input }: { staffId: string; input: Omit<TimeOffCreateInput, "staffId"> }) =>
      api.addStaffLeave(staffId, input),
    onSuccess: () => invalidate(),
  });
}

export function useRemoveStaffLeave() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ staffId, leaveId }: { staffId: string; leaveId: string }) =>
      api.removeStaffLeave(staffId, leaveId),
    onSuccess: () => invalidate(),
  });
}

/* Bookings */

export function useBookings(query: Partial<BookingsQuery> = {}) {
  return useQuery({
    queryKey: ["salon-owner", "bookings", query],
    queryFn: () => api.listBookings(query),
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ["salon-owner", "booking", bookingId],
    queryFn: () => api.getBooking(bookingId),
    enabled: Boolean(bookingId),
  });
}

export function useCreateBooking() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (input: BookingCreateInput) => api.createBooking(input),
    onSuccess: () => invalidate(),
  });
}

export function useAssignBookingStaff() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: BookingAssignStaffInput }) =>
      api.assignBookingStaff(bookingId, input),
    onSuccess: () => invalidate(),
  });
}

export function useRecordStaffDecision() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: BookingStaffDecisionInput }) =>
      api.recordStaffDecision(bookingId, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeclineBooking() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      api.declineBooking(bookingId, reason),
    onSuccess: () => invalidate(),
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      api.cancelBooking(bookingId, reason),
    onSuccess: () => invalidate(),
  });
}

export function useRescheduleBooking() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: BookingRescheduleInput }) =>
      api.rescheduleBooking(bookingId, input),
    onSuccess: () => invalidate(),
  });
}

export function useCompleteBooking() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (bookingId: string) => api.completeBooking(bookingId),
    onSuccess: () => invalidate(),
  });
}

export function useMarkBookingNoShow() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: (bookingId: string) => api.markBookingNoShow(bookingId),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateBookingNotes() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: BookingNotesInput }) =>
      api.updateBookingNotes(bookingId, input),
    onSuccess: () => invalidate(),
  });
}

/* Customers */

export function useCustomers(query: Partial<CustomersQuery> = {}) {
  return useQuery({
    queryKey: ["salon-owner", "customers", query],
    queryFn: () => api.listCustomers(query),
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ["salon-owner", "customer", customerId],
    queryFn: () => api.getCustomer(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCustomerBookingHistory(customerId: string) {
  return useQuery({
    queryKey: ["salon-owner", "customer-bookings", customerId],
    queryFn: () => api.getCustomerBookingHistory(customerId),
    enabled: Boolean(customerId),
  });
}

export function useUpdateCustomerNotes() {
  const invalidate = useInvalidateSalonOwner();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId: string; input: CustomerNotesInput }) =>
      api.updateCustomerNotes(customerId, input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateOwnerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerProfileInput) => api.updateOwnerProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

/* Dashboard */

export function useSalonOwnerDashboard() {
  return useQuery({
    queryKey: ["salon-owner", "dashboard"],
    queryFn: api.getSalonOwnerDashboard,
  });
}

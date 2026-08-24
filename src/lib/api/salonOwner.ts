import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http";
import type {
  BookingAssignStaffInput,
  BookingCreateInput,
  BookingDTO,
  BookingNotesInput,
  BookingRescheduleInput,
  BookingsQuery,
  BookingStaffDecisionInput,
  CustomerDTO,
  CustomerNotesInput,
  CustomersQuery,
  MeResponse,
  OwnerProfileInput,
  PaginatedResult,
  ResubmitSalonApplicationInput,
  SalonBookingSettingsInput,
  SalonDTO,
  SalonOwnerDashboardDTO,
  SalonProfileInput,
  ServiceDTO,
  ServiceInput,
  ServicePatchInput,
  ServicesQuery,
  StaffDTO,
  StaffInput,
  StaffPatchInput,
  StaffQuery,
  TimeOffCreateInput,
  TimeOffDTO,
  UserDTO,
  WorkingHoursUpdateInput,
} from "@/lib/shared";

/* Application / onboarding (pre-existing) */

export function getMyApplication() {
  return apiGet<MeResponse>("/api/salon-owner/application");
}

export function resubmitApplication(input: ResubmitSalonApplicationInput) {
  return apiPatch<{ resubmitted: true }>("/api/salon-owner/application/resubmit", input);
}

export function uploadSalonLogo(file: File) {
  const form = new FormData();
  form.set("logo", file);
  return apiPost<SalonDTO>("/api/salon-owner/application/logo", form);
}

export function uploadVerificationDocument(file: File) {
  const form = new FormData();
  form.set("document", file);
  return apiPost<SalonDTO>("/api/salon-owner/application/verification-document", form);
}

export function getMyVerificationDocumentDownloadUrl() {
  return apiGet<{ url: string }>("/api/salon-owner/application/verification-document/download");
}

/* Salon profile */

export function getMySalon() {
  return apiGet<SalonDTO>("/api/salon-owner/salon");
}

export function updateSalonProfile(input: SalonProfileInput) {
  return apiPatch<SalonDTO>("/api/salon-owner/salon", input);
}

export function updateBookingSettings(input: SalonBookingSettingsInput) {
  return apiPatch<SalonDTO>("/api/salon-owner/salon/booking-settings", input);
}

export function updateWorkingHours(input: WorkingHoursUpdateInput) {
  return apiPatch<SalonDTO>("/api/salon-owner/salon/working-hours", input);
}

export function uploadSalonLogoActive(file: File) {
  const form = new FormData();
  form.set("logo", file);
  return apiPost<SalonDTO>("/api/salon-owner/salon/logo", form);
}

export function uploadSalonCover(file: File) {
  const form = new FormData();
  form.set("cover", file);
  return apiPost<SalonDTO>("/api/salon-owner/salon/cover", form);
}

export function addGalleryImage(file: File) {
  const form = new FormData();
  form.set("image", file);
  return apiPost<SalonDTO>("/api/salon-owner/salon/gallery", form);
}

export function removeGalleryImage(url: string) {
  return apiDelete<SalonDTO>("/api/salon-owner/salon/gallery", { url });
}

/* Time off (salon-wide blocked time) */

export function listTimeOff() {
  return apiGet<TimeOffDTO[]>("/api/salon-owner/time-off");
}

export function addSalonBlockedTime(input: Omit<TimeOffCreateInput, "staffId">) {
  return apiPost<TimeOffDTO>("/api/salon-owner/time-off", input);
}

export function removeTimeOff(timeOffId: string) {
  return apiDelete<{ removed: true }>(`/api/salon-owner/time-off/${timeOffId}`);
}

/* Services */

export function listServices(query: Partial<ServicesQuery> = {}) {
  return apiGet<PaginatedResult<ServiceDTO>>(
    "/api/salon-owner/services",
    query as Record<string, string | number | undefined>,
  );
}

export function getService(serviceId: string) {
  return apiGet<ServiceDTO>(`/api/salon-owner/services/${serviceId}`);
}

export function createService(input: ServiceInput) {
  return apiPost<ServiceDTO>("/api/salon-owner/services", input);
}

export function updateService(serviceId: string, input: ServicePatchInput) {
  return apiPatch<ServiceDTO>(`/api/salon-owner/services/${serviceId}`, input);
}

export function setServiceActive(serviceId: string, isActive: boolean) {
  return apiPatch<ServiceDTO>(`/api/salon-owner/services/${serviceId}/status`, { isActive });
}

export function duplicateService(serviceId: string) {
  return apiPost<ServiceDTO>(`/api/salon-owner/services/${serviceId}/duplicate`);
}

/* Staff */

export function listStaff(query: Partial<StaffQuery> = {}) {
  return apiGet<PaginatedResult<StaffDTO>>(
    "/api/salon-owner/staff",
    query as Record<string, string | number | undefined>,
  );
}

export function getStaffMember(staffId: string) {
  return apiGet<StaffDTO>(`/api/salon-owner/staff/${staffId}`);
}

export function createStaffMember(input: StaffInput) {
  return apiPost<StaffDTO>("/api/salon-owner/staff", input);
}

export function updateStaffMember(staffId: string, input: StaffPatchInput) {
  return apiPatch<StaffDTO>(`/api/salon-owner/staff/${staffId}`, input);
}

export function setStaffActive(staffId: string, isActive: boolean) {
  return apiPatch<StaffDTO>(`/api/salon-owner/staff/${staffId}/status`, { isActive });
}

export function uploadStaffPhoto(staffId: string, file: File) {
  const form = new FormData();
  form.set("photo", file);
  return apiPost<StaffDTO>(`/api/salon-owner/staff/${staffId}/photo`, form);
}

export function listStaffLeave(staffId: string) {
  return apiGet<TimeOffDTO[]>(`/api/salon-owner/staff/${staffId}/leave`);
}

export function addStaffLeave(staffId: string, input: Omit<TimeOffCreateInput, "staffId">) {
  return apiPost<TimeOffDTO>(`/api/salon-owner/staff/${staffId}/leave`, input);
}

export function removeStaffLeave(staffId: string, leaveId: string) {
  return apiDelete<{ removed: true }>(`/api/salon-owner/staff/${staffId}/leave/${leaveId}`);
}

/* Bookings */

export function listBookings(query: Partial<BookingsQuery> = {}) {
  return apiGet<PaginatedResult<BookingDTO>>(
    "/api/salon-owner/bookings",
    query as Record<string, string | number | undefined>,
  );
}

export function getBooking(bookingId: string) {
  return apiGet<BookingDTO>(`/api/salon-owner/bookings/${bookingId}`);
}

export function createBooking(input: BookingCreateInput) {
  return apiPost<BookingDTO>("/api/salon-owner/bookings", input);
}

export function assignBookingStaff(bookingId: string, input: BookingAssignStaffInput) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/assign-staff`, input);
}

export function recordStaffDecision(bookingId: string, input: BookingStaffDecisionInput) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/staff-decision`, input);
}

export function declineBooking(bookingId: string, reason: string) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/decline`, { reason });
}

export function cancelBooking(bookingId: string, reason: string) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/cancel`, { reason });
}

export function rescheduleBooking(bookingId: string, input: BookingRescheduleInput) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/reschedule`, input);
}

export function completeBooking(bookingId: string) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/complete`);
}

export function markBookingNoShow(bookingId: string) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/no-show`);
}

export function updateBookingNotes(bookingId: string, input: BookingNotesInput) {
  return apiPatch<BookingDTO>(`/api/salon-owner/bookings/${bookingId}/notes`, input);
}

/* Customers */

export function listCustomers(query: Partial<CustomersQuery> = {}) {
  return apiGet<PaginatedResult<CustomerDTO>>(
    "/api/salon-owner/customers",
    query as Record<string, string | number | undefined>,
  );
}

export function getCustomer(customerId: string) {
  return apiGet<CustomerDTO>(`/api/salon-owner/customers/${customerId}`);
}

export function updateCustomerNotes(customerId: string, input: CustomerNotesInput) {
  return apiPatch<CustomerDTO>(`/api/salon-owner/customers/${customerId}/notes`, input);
}

export function getCustomerBookingHistory(customerId: string) {
  return apiGet<BookingDTO[]>(`/api/salon-owner/customers/${customerId}/bookings`);
}

export function updateOwnerProfile(input: OwnerProfileInput) {
  return apiPatch<UserDTO>("/api/salon-owner/profile", input);
}

/* Dashboard */

export function getSalonOwnerDashboard() {
  return apiGet<SalonOwnerDashboardDTO>("/api/salon-owner/dashboard");
}

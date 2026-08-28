import { z } from "zod";
import { ALL_SALON_STATUSES } from "./salon-status";
import { ALL_BOOKING_SOURCES, ALL_BOOKING_STATUSES } from "./booking-status";
import { DAYS_OF_WEEK } from "./working-hours";

/**
 * Validation rules shared by the backend (real enforcement, via the
 * validate() middleware) and the frontend (immediate form feedback via
 * react-hook-form's zodResolver) — one source of truth for both.
 */

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number");

const ownerInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the owner's full name").max(120),
  email: z.email("Enter a valid email address"),
  phone: phoneSchema,
  password: z.string().min(8, "Use at least 8 characters"),
});

export const salonInfoSchema = z.object({
  name: z.string().trim().min(2, "Enter the salon name").max(120),
  businessPhone: phoneSchema,
  businessEmail: z.email("Enter a valid business email address"),
  address: z.string().trim().min(4, "Enter the salon address").max(240),
  city: z.string().trim().min(2, "Enter the city").max(80),
  district: z.string().trim().min(2, "Enter the district").max(80),
  businessRegistrationNumber: z.string().trim().max(60).optional(),
  description: z.string().trim().min(10, "Add a short description").max(1000),
  category: z
    .string({ error: "Choose a salon category" })
    .trim()
    .min(1, "Choose a salon category")
    .max(60),
  numberOfStaff: z.coerce.number().int().min(1).max(500),
});

export const registerSalonOwnerSchema = z.object({
  owner: ownerInfoSchema,
  salon: salonInfoSchema,
});

export type RegisterSalonOwnerInput = z.infer<typeof registerSalonOwnerSchema>;

/** Used when a rejected owner edits and resubmits their application. */
export const resubmitSalonApplicationSchema = z.object({
  salon: salonInfoSchema.partial(),
});

export type ResubmitSalonApplicationInput = z.infer<typeof resubmitSalonApplicationSchema>;

export const reasonRequiredSchema = z.object({
  reason: z.string().trim().min(10, "Provide a reason of at least 10 characters").max(1000),
});

export type ReasonRequiredInput = z.infer<typeof reasonRequiredSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/** Shared by GET salon-applications and GET salons (both list the salons collection). */
export type PaginationQuery = z.infer<typeof paginationSchema>;

export const salonsQuerySchema = paginationSchema.extend({
  status: z.enum(ALL_SALON_STATUSES).optional(),
  search: z.string().trim().max(120).optional(),
  district: z.string().trim().max(80).optional(),
  category: z.string().trim().max(60).optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
  sortBy: z.enum(["createdAt", "name"]).default("createdAt"),
});

export type SalonsQuery = z.infer<typeof salonsQuerySchema>;

export const salonOwnersQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  verificationStatus: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "fullName"]).default("createdAt"),
});

export type SalonOwnersQuery = z.infer<typeof salonOwnersQuerySchema>;

export const auditLogsQuerySchema = paginationSchema.extend({
  targetSalonId: z.string().trim().optional(),
  action: z.string().trim().optional(),
});

export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>;

export const verificationHistoryQuerySchema = paginationSchema.extend({
  salonId: z.string().trim().optional(),
});

export type VerificationHistoryQuery = z.infer<typeof verificationHistoryQuerySchema>;

/* ------------------------------------------------------------------ */
/* Platform-admin: salon categories                                    */
/* ------------------------------------------------------------------ */

const categoryLabelSchema = z
  .string()
  .trim()
  .min(2, "Enter a category name of at least 2 characters")
  .max(60, "Keep the category name under 60 characters");

export const salonCategoryCreateSchema = z.object({
  label: categoryLabelSchema,
  /** Optional: derived from the label (slugified) when omitted. */
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, "Use lowercase letters, numbers, and underscores only")
    .max(60)
    .optional(),
  isActive: z.boolean().default(true),
});

export type SalonCategoryCreateInput = z.infer<typeof salonCategoryCreateSchema>;

export const salonCategoryUpdateSchema = z
  .object({
    label: categoryLabelSchema.optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Provide at least one field to update" });

export type SalonCategoryUpdateInput = z.infer<typeof salonCategoryUpdateSchema>;

/* ------------------------------------------------------------------ */
/* Salon-owner panel                                                   */
/* ------------------------------------------------------------------ */

/** Sri Lankan mobile/landline numbers: +94XXXXXXXXX or 0XXXXXXXXX. */
export const lkPhoneSchema = z
  .string()
  .trim()
  .regex(/^(\+94\d{9}|0\d{9})$/, "Enter a valid Sri Lankan phone number (+94XXXXXXXXX or 0XXXXXXXXX)");

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24h HH:mm format");

const dayBreakSchema = z.object({
  start: timeOfDaySchema,
  end: timeOfDaySchema,
});

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  open: timeOfDaySchema,
  close: timeOfDaySchema,
  breaks: z.array(dayBreakSchema).max(6),
});

export const weeklyHoursSchema = z.object(
  Object.fromEntries(DAYS_OF_WEEK.map((day) => [day, dayHoursSchema])) as Record<
    (typeof DAYS_OF_WEEK)[number],
    typeof dayHoursSchema
  >,
);

export const specialDayHoursSchema = z.object({
  date: z.iso.date(),
  label: z.string().trim().min(2).max(120),
  isClosed: z.boolean(),
  open: timeOfDaySchema.nullable(),
  close: timeOfDaySchema.nullable(),
});

export const salonClosureSchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  reason: z.string().trim().min(3).max(300),
});

const socialLinksSchema = z.object({
  instagram: z.url().nullable().optional(),
  facebook: z.url().nullable().optional(),
  tiktok: z.url().nullable().optional(),
  website: z.url().nullable().optional(),
});

/**
 * Owner-editable salon profile fields. Deliberately excludes status,
 * verificationStatus, role, approval/suspension metadata, ownerId, and
 * slug — those are platform-admin-only or system-derived.
 */
export const salonProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(10).max(1000).optional(),
  businessEmail: z.email().optional(),
  businessPhone: lkPhoneSchema.optional(),
  whatsappNumber: lkPhoneSchema.nullable().optional(),
  address: z.string().trim().min(4).max(240).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  district: z.string().trim().min(2).max(80).optional(),
  googleMapsUrl: z.url().nullable().optional(),
  facilities: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  languages: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
  socialLinks: socialLinksSchema.optional(),
  bookingInstructions: z.string().trim().max(1000).nullable().optional(),
  cancellationPolicy: z.string().trim().max(1000).nullable().optional(),
  depositPolicy: z.string().trim().max(1000).nullable().optional(),
});

export type SalonProfileInput = z.infer<typeof salonProfileSchema>;

export const salonBookingSettingsSchema = z.object({
  noticePeriodMinutes: z.coerce.number().int().min(0).max(10080),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(120),
  cancellationWindowHours: z.coerce.number().int().min(0).max(720),
});

export type SalonBookingSettingsInput = z.infer<typeof salonBookingSettingsSchema>;

export const workingHoursUpdateSchema = z.object({
  weeklyHours: weeklyHoursSchema.optional(),
  specialHours: z.array(specialDayHoursSchema.extend({ id: z.string().optional() })).optional(),
  closures: z.array(salonClosureSchema.extend({ id: z.string().optional() })).optional(),
});

export type WorkingHoursUpdateInput = z.infer<typeof workingHoursUpdateSchema>;

export const timeOffCreateSchema = z.object({
  staffId: z.string().trim().nullable(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  reason: z.string().trim().min(3).max(300),
});

export type TimeOffCreateInput = z.infer<typeof timeOffCreateSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(1000).default(""),
  durationMinutes: z.coerce.number().int().min(5).max(600),
  priceLkr: z.coerce.number().min(0).max(10_000_000),
  discountedPriceLkr: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  depositLkr: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  assignedStaffIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export const servicePatchSchema = serviceSchema.partial();
export type ServicePatchInput = z.infer<typeof servicePatchSchema>;

export const servicesQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sortBy: z.enum(["createdAt", "name", "priceLkr"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type ServicesQuery = z.infer<typeof servicesQuerySchema>;

const staffDayAvailabilitySchema = z.object({
  isWorking: z.boolean(),
  start: timeOfDaySchema,
  end: timeOfDaySchema,
  breaks: z.array(dayBreakSchema).max(6),
});

export const staffWeeklyAvailabilitySchema = z.object(
  Object.fromEntries(DAYS_OF_WEEK.map((day) => [day, staffDayAvailabilitySchema])) as Record<
    (typeof DAYS_OF_WEEK)[number],
    typeof staffDayAvailabilitySchema
  >,
);

export const staffSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: lkPhoneSchema,
  email: z.email().nullable().optional(),
  jobTitle: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(1000).nullable().optional(),
  assignedServiceIds: z.array(z.string()).default([]),
  weeklyAvailability: staffWeeklyAvailabilitySchema,
  isActive: z.boolean().default(true),
  canAcceptBookings: z.boolean().default(true),
});

export type StaffInput = z.infer<typeof staffSchema>;
export const staffPatchSchema = staffSchema.partial();
export type StaffPatchInput = z.infer<typeof staffPatchSchema>;

export const staffQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sortBy: z.enum(["createdAt", "fullName"]).default("fullName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type StaffQuery = z.infer<typeof staffQuerySchema>;

export const bookingCreateSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: lkPhoneSchema,
  customerEmail: z.email().nullable().optional(),
  serviceId: z.string().trim().min(1),
  staffId: z.string().trim().nullable().optional(),
  startAt: z.iso.datetime(),
  source: z.enum(ALL_BOOKING_SOURCES).default("WALK_IN"),
  internalNotes: z.string().trim().max(1000).nullable().optional(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingAssignStaffSchema = z.object({
  staffId: z.string().trim().min(1),
});

export type BookingAssignStaffInput = z.infer<typeof bookingAssignStaffSchema>;

export const bookingStaffDecisionSchema = z
  .object({
    decision: z.enum(["ACCEPTED", "REJECTED"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.decision !== "REJECTED" || Boolean(v.reason?.trim()), {
    message: "Provide a reason the staff member is rejecting this booking",
    path: ["reason"],
  });

export type BookingStaffDecisionInput = z.infer<typeof bookingStaffDecisionSchema>;

export const bookingRescheduleSchema = z.object({
  startAt: z.iso.datetime(),
  staffId: z.string().trim().nullable().optional(),
});

export type BookingRescheduleInput = z.infer<typeof bookingRescheduleSchema>;

export const bookingNotesSchema = z.object({
  notes: z.string().trim().max(2000),
});

export type BookingNotesInput = z.infer<typeof bookingNotesSchema>;

export const customerNotesSchema = z.object({
  notes: z.string().trim().max(2000),
});

export type CustomerNotesInput = z.infer<typeof customerNotesSchema>;

export const bookingsQuerySchema = paginationSchema.extend({
  status: z.enum(ALL_BOOKING_STATUSES).optional(),
  staffId: z.string().trim().optional(),
  serviceId: z.string().trim().optional(),
  search: z.string().trim().max(120).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  sortBy: z.enum(["startAt", "createdAt"]).default("startAt"),
});

export type BookingsQuery = z.infer<typeof bookingsQuerySchema>;

export const ownerProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: lkPhoneSchema,
});

export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;

export const customersQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  sortBy: z.enum(["createdAt", "fullName", "lastVisitAt"]).default("fullName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CustomersQuery = z.infer<typeof customersQuerySchema>;

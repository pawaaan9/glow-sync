import { z } from "zod";
import { ALL_SALON_CATEGORIES } from "./salon-category";
import { ALL_SALON_STATUSES } from "./salon-status";

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
  category: z.enum(ALL_SALON_CATEGORIES, { error: "Choose a salon category" }),
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
  category: z.enum(ALL_SALON_CATEGORIES).optional(),
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

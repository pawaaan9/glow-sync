/** Firestore top-level collection names. */
export const COLLECTIONS = {
  USERS: "users",
  /** Platform (super) admin accounts live apart from ordinary users. */
  SUPER_ADMINS: "superAdmins",
  SALONS: "salons",
  SALON_VERIFICATION_HISTORY: "salonVerificationHistory",
  AUDIT_LOGS: "auditLogs",
  NOTIFICATIONS: "notifications",
  /** Top-level (not nested) so a booking can be queried across the whole platform by date/staff/status. */
  BOOKINGS: "bookings",
} as const;

/** Subcollections nested under salons/{salonId} — naturally salon-scoped. */
export const SALON_SUBCOLLECTIONS = {
  SERVICES: "services",
  STAFF: "staff",
  CUSTOMERS: "customers",
  /** Both staff leave (staffId set) and whole-salon blocked time (staffId null). */
  TIME_OFF: "timeOff",
} as const;

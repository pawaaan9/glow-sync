/** Firestore top-level collection names. */
export const COLLECTIONS = {
  USERS: "users",
  /** Platform (super) admin accounts live apart from ordinary users. */
  SUPER_ADMINS: "superAdmins",
  SALONS: "salons",
  SALON_VERIFICATION_HISTORY: "salonVerificationHistory",
  AUDIT_LOGS: "auditLogs",
  NOTIFICATIONS: "notifications",
} as const;

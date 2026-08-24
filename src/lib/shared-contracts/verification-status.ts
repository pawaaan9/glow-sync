/** Verification status stored on a salon_owner's users/{userId} document. */
export const VERIFICATION_STATUS = {
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const ALL_VERIFICATION_STATUSES: VerificationStatus[] =
  Object.values(VERIFICATION_STATUS);

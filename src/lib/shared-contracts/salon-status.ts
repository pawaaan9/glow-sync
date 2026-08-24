/** Lifecycle status stored on a salons/{salonId} document. */
export const SALON_STATUS = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type SalonStatus = (typeof SALON_STATUS)[keyof typeof SALON_STATUS];

export const ALL_SALON_STATUSES: SalonStatus[] = Object.values(SALON_STATUS);

/** Statuses that make a salon visible in public search / listings. */
export const PUBLICLY_VISIBLE_SALON_STATUSES: SalonStatus[] = [SALON_STATUS.ACTIVE];

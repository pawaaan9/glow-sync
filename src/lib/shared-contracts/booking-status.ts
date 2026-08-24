/** Lifecycle status stored on a bookings/{bookingId} document. */
export const BOOKING_STATUS = {
  PENDING_SALON_REVIEW: "PENDING_SALON_REVIEW",
  PENDING_STAFF_ACCEPTANCE: "PENDING_STAFF_ACCEPTANCE",
  CONFIRMED: "CONFIRMED",
  REJECTED_BY_STAFF: "REJECTED_BY_STAFF",
  DECLINED_BY_SALON: "DECLINED_BY_SALON",
  CANCELLED_BY_CUSTOMER: "CANCELLED_BY_CUSTOMER",
  CANCELLED_BY_SALON: "CANCELLED_BY_SALON",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const ALL_BOOKING_STATUSES: BookingStatus[] = Object.values(BOOKING_STATUS);

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_SALON_REVIEW: "Pending review",
  PENDING_STAFF_ACCEPTANCE: "Awaiting staff",
  CONFIRMED: "Confirmed",
  REJECTED_BY_STAFF: "Rejected by staff",
  DECLINED_BY_SALON: "Declined",
  CANCELLED_BY_CUSTOMER: "Cancelled by customer",
  CANCELLED_BY_SALON: "Cancelled by salon",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

/** Statuses that still occupy a slot on the calendar / block availability. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING_SALON_REVIEW,
  BOOKING_STATUS.PENDING_STAFF_ACCEPTANCE,
  BOOKING_STATUS.CONFIRMED,
];

/**
 * Statuses that can no longer transition to anything else. Notably,
 * REJECTED_BY_STAFF is NOT terminal — the owner re-assigns another staff
 * member, which moves it back to PENDING_STAFF_ACCEPTANCE.
 */
export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.DECLINED_BY_SALON,
  BOOKING_STATUS.CANCELLED_BY_CUSTOMER,
  BOOKING_STATUS.CANCELLED_BY_SALON,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.NO_SHOW,
];

export const BOOKING_SOURCES = {
  CUSTOMER_APP: "CUSTOMER_APP",
  WALK_IN: "WALK_IN",
  PHONE: "PHONE",
  WHATSAPP: "WHATSAPP",
} as const;

export type BookingSource = (typeof BOOKING_SOURCES)[keyof typeof BOOKING_SOURCES];

export const ALL_BOOKING_SOURCES: BookingSource[] = Object.values(BOOKING_SOURCES);

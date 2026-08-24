import { VERIFICATION_STATUS, type VerificationStatus } from "@/lib/shared";

export const SALON_OWNER_STATUS_PATHS = {
  [VERIFICATION_STATUS.PENDING_VERIFICATION]: "/salon-owner/verification-pending",
  [VERIFICATION_STATUS.REJECTED]: "/salon-owner/application-rejected",
  [VERIFICATION_STATUS.SUSPENDED]: "/salon-owner/account-suspended",
} as const;

export const SALON_OWNER_DASHBOARD_PATH = "/salon-owner/dashboard";

const STATUS_PAGES: string[] = Object.values(SALON_OWNER_STATUS_PATHS);

/**
 * Pure decision function for where a salon_owner should land, kept apart
 * from React/Next so it can be unit-tested without rendering anything or
 * mocking the router. Returns the path to redirect to, or null to stay put.
 *
 * - Not yet APPROVED: always pinned to their status page, even if they
 *   manually type a dashboard URL — this is the actual, testable
 *   enforcement of "prevent manually entering dashboard URLs when the
 *   owner is not approved" (the backend enforces it for real; this just
 *   keeps the UI from showing a confusing 403 mid-navigation).
 * - APPROVED: free to be anywhere under /salon-owner/ except a stale
 *   status page, which bounces them to the dashboard.
 */
export function getSalonOwnerRedirectPath(
  status: VerificationStatus,
  pathname: string,
): string | null {
  if (status === VERIFICATION_STATUS.APPROVED) {
    return STATUS_PAGES.includes(pathname) ? SALON_OWNER_DASHBOARD_PATH : null;
  }

  const requiredPath = SALON_OWNER_STATUS_PATHS[status];
  return pathname === requiredPath ? null : requiredPath;
}

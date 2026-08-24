import { ROLES, type Role } from "@/lib/shared";

/**
 * Pure decision function for where to send a user right after login,
 * based only on their role. For salon_owner this intentionally always
 * points at /salon-owner/dashboard — SalonOwnerStatusGate (see
 * salon-owner-redirect.ts) then refines that further based on
 * verificationStatus, so the two concerns stay independently testable.
 */
export function getPostLoginRedirectPath(role: Role): string {
  switch (role) {
    case ROLES.PLATFORM_ADMIN:
      return "/platform-admin";
    case ROLES.SALON_OWNER:
      return "/salon-owner/dashboard";
    case ROLES.STAFF:
      return "/dashboard/staff";
    case ROLES.RECEPTIONIST:
      return "/dashboard/staff";
    case ROLES.CUSTOMER:
    default:
      return "/dashboard/customer";
  }
}

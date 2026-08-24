export const ROLES = {
  PLATFORM_ADMIN: "platform_admin",
  SALON_OWNER: "salon_owner",
  RECEPTIONIST: "receptionist",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

/** Roles that go through the salon-owner verification lifecycle. */
export const VERIFIABLE_ROLES: Role[] = [ROLES.SALON_OWNER];

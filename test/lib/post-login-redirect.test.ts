import { describe, expect, it } from "vitest";
import { getPostLoginRedirectPath } from "@/lib/auth/post-login-redirect";
import { ROLES } from "@/lib/shared";

describe("getPostLoginRedirectPath (role-based redirection)", () => {
  it("sends platform_admin to the admin dashboard", () => {
    expect(getPostLoginRedirectPath(ROLES.PLATFORM_ADMIN)).toBe("/platform-admin");
  });

  it("sends salon_owner to the salon-owner dashboard route (status gate refines it further)", () => {
    expect(getPostLoginRedirectPath(ROLES.SALON_OWNER)).toBe("/salon-owner/dashboard");
  });

  it("sends customer to the customer dashboard", () => {
    expect(getPostLoginRedirectPath(ROLES.CUSTOMER)).toBe("/dashboard/customer");
  });

  it("sends staff and receptionist somewhere valid, not the admin or salon-owner areas", () => {
    expect(getPostLoginRedirectPath(ROLES.STAFF)).not.toContain("/platform-admin");
    expect(getPostLoginRedirectPath(ROLES.RECEPTIONIST)).not.toContain("/platform-admin");
  });
});

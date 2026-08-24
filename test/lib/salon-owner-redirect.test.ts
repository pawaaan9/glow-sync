import { describe, expect, it } from "vitest";
import {
  getSalonOwnerRedirectPath,
  SALON_OWNER_DASHBOARD_PATH,
  SALON_OWNER_STATUS_PATHS,
} from "@/lib/auth/salon-owner-redirect";
import { VERIFICATION_STATUS } from "@/lib/shared";

describe("getSalonOwnerRedirectPath (status-based redirection)", () => {
  it("sends a PENDING_VERIFICATION owner to the pending page from anywhere", () => {
    expect(
      getSalonOwnerRedirectPath(VERIFICATION_STATUS.PENDING_VERIFICATION, "/salon-owner/dashboard"),
    ).toBe(SALON_OWNER_STATUS_PATHS.PENDING_VERIFICATION);
  });

  it("does not redirect when already on the correct status page", () => {
    expect(
      getSalonOwnerRedirectPath(
        VERIFICATION_STATUS.PENDING_VERIFICATION,
        SALON_OWNER_STATUS_PATHS.PENDING_VERIFICATION,
      ),
    ).toBeNull();
  });

  it("sends a REJECTED owner to the rejected page even if they manually type the dashboard URL", () => {
    expect(getSalonOwnerRedirectPath(VERIFICATION_STATUS.REJECTED, SALON_OWNER_DASHBOARD_PATH)).toBe(
      SALON_OWNER_STATUS_PATHS.REJECTED,
    );
  });

  it("sends a SUSPENDED owner to the suspended page", () => {
    expect(getSalonOwnerRedirectPath(VERIFICATION_STATUS.SUSPENDED, "/salon-owner/anything")).toBe(
      SALON_OWNER_STATUS_PATHS.SUSPENDED,
    );
  });

  it("lets an APPROVED owner stay on any dashboard-area path", () => {
    expect(
      getSalonOwnerRedirectPath(VERIFICATION_STATUS.APPROVED, "/salon-owner/dashboard/settings"),
    ).toBeNull();
  });

  it("bounces an APPROVED owner off a stale status page onto the dashboard", () => {
    expect(
      getSalonOwnerRedirectPath(
        VERIFICATION_STATUS.APPROVED,
        SALON_OWNER_STATUS_PATHS.PENDING_VERIFICATION,
      ),
    ).toBe(SALON_OWNER_DASHBOARD_PATH);
  });
});

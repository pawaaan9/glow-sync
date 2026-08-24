import { SALON_STATUS, VERIFICATION_STATUS } from "@/lib/shared";
import { resetRateLimits } from "@/server/http/rateLimit";
import { beforeEach, describe, expect, it } from "vitest";
import { callRoute } from "../helpers/callRoute";
import { seedSalonOwner } from "../helpers/seed";

interface ApplicationPayload {
  user: { verificationStatus: string | null };
  salon: { status: string } | null;
}

async function getDashboard(token: string) {
  const { GET } = await import("@/app/api/salon-owner/dashboard/route");
  return callRoute(GET, { token });
}

async function getOwnSalon(token: string) {
  const { GET } = await import("@/app/api/salon-owner/salon/route");
  return callRoute(GET, { token });
}

async function getApplication(token: string) {
  const { GET } = await import("@/app/api/salon-owner/application/route");
  return callRoute<ApplicationPayload>(GET, { token });
}

async function resubmit(token: string, body: unknown) {
  const { PATCH } = await import("@/app/api/salon-owner/application/resubmit/route");
  return callRoute(PATCH, { token, body, method: "PATCH" });
}

beforeEach(() => resetRateLimits());

describe("Salon-owner access control", () => {
  it("blocks a PENDING_VERIFICATION owner from salon-management APIs", async () => {
    const owner = seedSalonOwner();

    const dashboard = await getDashboard(owner.token);
    expect(dashboard.status).toBe(403);
    expect(dashboard.body.error!.code).toBe("ACCOUNT_UNVERIFIED");

    const salon = await getOwnSalon(owner.token);
    expect(salon.status).toBe(403);
  });

  it("still lets a PENDING owner view their own application", async () => {
    const owner = seedSalonOwner();

    const res = await getApplication(owner.token);

    expect(res.status).toBe(200);
    expect(res.body.data!.user.verificationStatus).toBe(VERIFICATION_STATUS.PENDING_VERIFICATION);
  });

  it("blocks a REJECTED owner from salon-management APIs", async () => {
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.REJECTED,
      salonStatus: SALON_STATUS.REJECTED,
    });

    const dashboard = await getDashboard(owner.token);
    expect(dashboard.status).toBe(403);
    expect(dashboard.body.error!.code).toBe("ACCOUNT_REJECTED");
  });

  it("blocks a SUSPENDED owner from salon-management APIs", async () => {
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.SUSPENDED,
      salonStatus: SALON_STATUS.SUSPENDED,
    });

    const dashboard = await getDashboard(owner.token);
    expect(dashboard.status).toBe(403);
    expect(dashboard.body.error!.code).toBe("ACCOUNT_SUSPENDED");
  });

  it("lets an APPROVED owner reach salon-management APIs", async () => {
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      salonStatus: SALON_STATUS.ACTIVE,
    });

    const res = await getDashboard(owner.token);
    expect(res.status).toBe(200);
  });

  it("returns a resubmitted application to PENDING_VERIFICATION / PENDING_APPROVAL", async () => {
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.REJECTED,
      salonStatus: SALON_STATUS.REJECTED,
    });

    const res = await resubmit(owner.token, {
      salon: { description: "Updated description addressing the rejection reason." },
    });
    expect(res.status).toBe(200);

    const check = await getApplication(owner.token);
    expect(check.body.data!.user.verificationStatus).toBe(VERIFICATION_STATUS.PENDING_VERIFICATION);
    expect(check.body.data!.salon!.status).toBe(SALON_STATUS.PENDING_APPROVAL);
  });

  it("refuses to resubmit an application that isn't REJECTED", async () => {
    const owner = seedSalonOwner();

    const res = await resubmit(owner.token, { salon: {} });
    expect(res.status).toBe(409);
  });

  it("blocks one owner from viewing another owner's salon", async () => {
    const ownerA = seedSalonOwner();
    const ownerB = seedSalonOwner();

    const { GET } = await import("@/app/api/salons/[salonId]/route");
    const res = await callRoute(GET, {
      token: ownerB.token,
      params: { salonId: ownerA.salonId },
    });

    expect(res.status).toBe(403);
  });

  it("blocks a salon owner from approving their own application", async () => {
    const owner = seedSalonOwner();

    const { PATCH } = await import(
      "@/app/api/platform-admin/salon-applications/[salonId]/approve/route"
    );
    const res = await callRoute(PATCH, {
      token: owner.token,
      params: { salonId: owner.salonId },
      method: "PATCH",
    });

    expect(res.status).toBe(403);
  });
});

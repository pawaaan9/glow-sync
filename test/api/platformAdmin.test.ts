import { COLLECTIONS, SALON_STATUS, VERIFICATION_STATUS } from "@/lib/shared";
import { resetRateLimits } from "@/server/http/rateLimit";
import { beforeEach, describe, expect, it } from "vitest";
import { callRoute } from "../helpers/callRoute";
import { seedCustomer, seedPlatformAdmin, seedSalonOwner } from "../helpers/seed";
import { fakeStore } from "../mocks/fakeFirestore";

async function dashboard(token?: string) {
  const { GET } = await import("@/app/api/platform-admin/dashboard/route");
  return callRoute(GET, { token });
}

async function listApplications(token: string) {
  const { GET } = await import("@/app/api/platform-admin/salon-applications/route");
  return callRoute<{ total: number }>(GET, { token });
}

async function approve(token: string, salonId: string) {
  const { PATCH } = await import(
    "@/app/api/platform-admin/salon-applications/[salonId]/approve/route"
  );
  return callRoute(PATCH, { token, params: { salonId }, method: "PATCH" });
}

async function reject(token: string, salonId: string, body: unknown) {
  const { PATCH } = await import(
    "@/app/api/platform-admin/salon-applications/[salonId]/reject/route"
  );
  return callRoute(PATCH, { token, params: { salonId }, body, method: "PATCH" });
}

async function suspend(token: string, salonId: string, body: unknown) {
  const { PATCH } = await import("@/app/api/platform-admin/salons/[salonId]/suspend/route");
  return callRoute(PATCH, { token, params: { salonId }, body, method: "PATCH" });
}

async function reactivate(token: string, salonId: string) {
  const { PATCH } = await import("@/app/api/platform-admin/salons/[salonId]/reactivate/route");
  return callRoute(PATCH, { token, params: { salonId }, method: "PATCH" });
}

async function ownerDashboard(token: string) {
  const { GET } = await import("@/app/api/salon-owner/dashboard/route");
  return callRoute(GET, { token });
}

beforeEach(() => resetRateLimits());

describe("Non-admin access to platform-admin endpoints", () => {
  it("blocks a customer", async () => {
    const customer = seedCustomer();
    const res = await dashboard(customer.token);
    expect(res.status).toBe(403);
  });

  it("blocks a salon owner", async () => {
    const owner = seedSalonOwner();
    const res = await listApplications(owner.token);
    expect(res.status).toBe(403);
  });

  it("blocks an unauthenticated request with 401", async () => {
    const res = await dashboard();
    expect(res.status).toBe(401);
  });
});

describe("Platform admin: listing", () => {
  it("can view pending applications", async () => {
    const admin = seedPlatformAdmin();
    seedSalonOwner({ salonStatus: SALON_STATUS.PENDING_APPROVAL });
    seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      salonStatus: SALON_STATUS.ACTIVE,
    });

    const res = await listApplications(admin.token);

    expect(res.status).toBe(200);
    expect(res.body.data!.total).toBe(2);
  });
});

describe("Platform admin: approve", () => {
  it("updates owner and salon atomically, stamps the audit trail, and notifies the owner", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner();

    const res = await approve(admin.token, owner.salonId);
    expect(res.status).toBe(200);

    const userDoc = fakeStore.getDoc(COLLECTIONS.USERS, owner.uid)!;
    expect(userDoc.verificationStatus).toBe(VERIFICATION_STATUS.APPROVED);
    expect(userDoc.verifiedBy).toBe(admin.uid);
    expect(userDoc.verifiedAt).toBeTruthy();

    const salonDoc = fakeStore.getDoc(COLLECTIONS.SALONS, owner.salonId)!;
    expect(salonDoc.status).toBe(SALON_STATUS.ACTIVE);
    expect(salonDoc.approvedBy).toBe(admin.uid);
    expect(salonDoc.approvedAt).toBeTruthy();

    const history = [...fakeStore.collections.get(COLLECTIONS.SALON_VERIFICATION_HISTORY)!.values()];
    expect(history.some((h) => h.action === "APPROVED" && h.salonId === owner.salonId)).toBe(true);

    const auditLogs = [...fakeStore.collections.get(COLLECTIONS.AUDIT_LOGS)!.values()];
    expect(auditLogs.some((a) => a.action === "APPLICATION_APPROVED")).toBe(true);

    const notifications = [...fakeStore.collections.get(COLLECTIONS.NOTIFICATIONS)!.values()];
    expect(
      notifications.some((n) => n.recipientId === owner.uid && n.type === "APPLICATION_APPROVED"),
    ).toBe(true);
  });

  it("rejects a duplicate approval with 409 and does not double-log", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner();

    expect((await approve(admin.token, owner.salonId)).status).toBe(200);
    expect((await approve(admin.token, owner.salonId)).status).toBe(409);

    const auditLogs = [...fakeStore.collections.get(COLLECTIONS.AUDIT_LOGS)!.values()].filter(
      (a) => a.action === "APPLICATION_APPROVED",
    );
    expect(auditLogs).toHaveLength(1);
  });
});

describe("Platform admin: reject", () => {
  it("requires a reason", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner();

    const res = await reject(admin.token, owner.salonId, {});
    expect(res.status).toBe(422);
  });

  it("rejects with a reason and blocks the owner's dashboard access", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner();

    const res = await reject(admin.token, owner.salonId, {
      reason: "Business registration number could not be verified.",
    });
    expect(res.status).toBe(200);

    const userDoc = fakeStore.getDoc(COLLECTIONS.USERS, owner.uid)!;
    expect(userDoc.verificationStatus).toBe(VERIFICATION_STATUS.REJECTED);
    expect(userDoc.rejectionReason).toContain("registration number");

    const owned = await ownerDashboard(owner.token);
    expect(owned.status).toBe(403);
    expect(owned.body.error!.code).toBe("ACCOUNT_REJECTED");
  });
});

describe("Platform admin: suspend / reactivate", () => {
  it("requires a reason to suspend", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      salonStatus: SALON_STATUS.ACTIVE,
    });

    const res = await suspend(admin.token, owner.salonId, {});
    expect(res.status).toBe(422);
  });

  it("suspends an active salon and immediately blocks salon-management APIs", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      salonStatus: SALON_STATUS.ACTIVE,
    });

    const res = await suspend(admin.token, owner.salonId, {
      reason: "Multiple unresolved customer complaints.",
    });
    expect(res.status).toBe(200);

    const owned = await ownerDashboard(owner.token);
    expect(owned.status).toBe(403);
    expect(owned.body.error!.code).toBe("ACCOUNT_SUSPENDED");
  });

  it("cannot suspend a salon that isn't ACTIVE", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner();

    const res = await suspend(admin.token, owner.salonId, {
      reason: "Some reason that is long enough.",
    });
    expect(res.status).toBe(409);
  });

  it("reactivation restores APPROVED / ACTIVE", async () => {
    const admin = seedPlatformAdmin();
    const owner = seedSalonOwner({
      verificationStatus: VERIFICATION_STATUS.SUSPENDED,
      salonStatus: SALON_STATUS.SUSPENDED,
    });

    const res = await reactivate(admin.token, owner.salonId);
    expect(res.status).toBe(200);

    const userDoc = fakeStore.getDoc(COLLECTIONS.USERS, owner.uid)!;
    expect(userDoc.verificationStatus).toBe(VERIFICATION_STATUS.APPROVED);
    const salonDoc = fakeStore.getDoc(COLLECTIONS.SALONS, owner.salonId)!;
    expect(salonDoc.status).toBe(SALON_STATUS.ACTIVE);

    const owned = await ownerDashboard(owner.token);
    expect(owned.status).toBe(200);
  });
});

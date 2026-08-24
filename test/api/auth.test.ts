import { COLLECTIONS, ROLES, SALON_STATUS, VERIFICATION_STATUS } from "@/lib/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { callRoute } from "../helpers/callRoute";
import { fakeStore } from "../mocks/fakeFirestore";
import { resetRateLimits } from "@/server/http/rateLimit";

const validPayload = {
  owner: {
    fullName: "Ava Rivera",
    email: "ava@example.com",
    phone: "+15551234567",
    password: "SuperSecret1!",
  },
  salon: {
    name: "Ava's Salon",
    businessPhone: "+15557654321",
    businessEmail: "salon@example.com",
    address: "1 Main Street",
    city: "Springfield",
    district: "Central",
    description: "A lovely neighbourhood salon.",
    category: "hair_salon",
    numberOfStaff: 4,
  },
};

async function register(body: unknown) {
  const { POST } = await import("@/app/api/auth/register-salon-owner/route");
  return callRoute<{ email: string; salonId: string }>(POST, { body, method: "POST" });
}

// The limiter counts across a whole module-scoped window, so without this
// the later cases in a file would start hitting 429 instead of the status
// they assert.
beforeEach(() => resetRateLimits());

describe("POST /api/auth/register-salon-owner", () => {
  it("creates pending owner and salon records", async () => {
    const res = await register(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const salonId = res.body.data!.salonId;

    const users = [...fakeStore.collections.get(COLLECTIONS.USERS)!.values()];
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      role: ROLES.SALON_OWNER,
      salonId,
      verificationStatus: VERIFICATION_STATUS.PENDING_VERIFICATION,
    });

    const salon = fakeStore.getDoc(COLLECTIONS.SALONS, salonId);
    expect(salon).toMatchObject({
      status: SALON_STATUS.PENDING_APPROVAL,
      ownerId: users[0]!.id,
      name: "Ava's Salon",
    });
  });

  it("creates an audit log entry and a notification for platform admins", async () => {
    await register(validPayload);

    const auditLogs = [...fakeStore.collections.get(COLLECTIONS.AUDIT_LOGS)!.values()];
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0]).toMatchObject({ action: "SALON_OWNER_REGISTERED" });

    const notifications = [...fakeStore.collections.get(COLLECTIONS.NOTIFICATIONS)!.values()];
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      recipientRole: ROLES.PLATFORM_ADMIN,
      type: "SALON_APPLICATION_SUBMITTED",
    });
  });

  it("never lets the client assign a role — the endpoint always produces salon_owner", async () => {
    const res = await register({ ...validPayload, role: ROLES.PLATFORM_ADMIN });

    expect(res.status).toBe(201);
    const users = [...fakeStore.collections.get(COLLECTIONS.USERS)!.values()];
    expect(users[0]!.role).toBe(ROLES.SALON_OWNER);
    expect(users[0]!.role).not.toBe(ROLES.PLATFORM_ADMIN);
  });

  it("rejects an incomplete payload with 422 validation error", async () => {
    const res = await register({});
    expect(res.status).toBe(422);
    expect(res.body.error!.code).toBe("VALIDATION_ERROR");
  });

  it("returns 409 on a duplicate email instead of creating a second application", async () => {
    await register(validPayload);
    const second = await register(validPayload);

    expect(second.status).toBe(409);
    const users = [...fakeStore.collections.get(COLLECTIONS.USERS)!.values()];
    expect(users).toHaveLength(1);
  });

  it("rate-limits repeated registration attempts", async () => {
    // The auth limiter allows 10 per window; the 11th must be refused.
    for (let i = 0; i < 10; i += 1) {
      await register({ ...validPayload, owner: { ...validPayload.owner, email: `a${i}@x.com` } });
    }
    const blocked = await register(validPayload);

    expect(blocked.status).toBe(429);
    expect(blocked.body.error!.code).toBe("RATE_LIMITED");
  });
});

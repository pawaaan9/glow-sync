import { ROLES, timeOffCreateSchema, type TimeOffCreateInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { addSalonBlockedTime, listTimeOff } from "@/server/services/timeOffService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listTimeOff(salon.id);
  },
});

/** Whole-salon blocked time. Per-staff leave is created via /api/salon-owner/staff/[staffId]/leave. */
export const POST = defineRoute<Omit<TimeOffCreateInput, "staffId">>({
  roles: [ROLES.SALON_OWNER],
  body: timeOffCreateSchema.omit({ staffId: true }),
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return addSalonBlockedTime(salon.id, user.uid, body);
  },
});

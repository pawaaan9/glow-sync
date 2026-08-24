import { ROLES, timeOffCreateSchema, type TimeOffCreateInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { addStaffLeave, listStaffLeave } from "@/server/services/staffService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listStaffLeave(salon.id, params.staffId);
  },
});

export const POST = defineRoute<Omit<TimeOffCreateInput, "staffId">, undefined, { staffId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: timeOffCreateSchema.omit({ staffId: true }),
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return addStaffLeave(salon.id, user.uid, params.staffId, body);
  },
});

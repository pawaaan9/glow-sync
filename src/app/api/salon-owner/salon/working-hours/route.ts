import { ROLES, workingHoursUpdateSchema, type WorkingHoursUpdateInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { updateWorkingHours } from "@/server/services/salonProfileService";

export const runtime = "nodejs";

export const PATCH = defineRoute<WorkingHoursUpdateInput>({
  roles: [ROLES.SALON_OWNER],
  body: workingHoursUpdateSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateWorkingHours(salon.id, user.uid, body);
  },
});

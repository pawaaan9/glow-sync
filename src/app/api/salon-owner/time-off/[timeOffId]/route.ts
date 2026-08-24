import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { removeTimeOff } from "@/server/services/timeOffService";

export const runtime = "nodejs";

export const DELETE = defineRoute<undefined, undefined, { timeOffId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    await removeTimeOff(salon.id, user.uid, params.timeOffId);
    return { removed: true };
  },
});

import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { removeStaffLeave } from "@/server/services/staffService";

export const runtime = "nodejs";

export const DELETE = defineRoute<undefined, undefined, { staffId: string; leaveId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    await removeStaffLeave(salon.id, user.uid, params.staffId, params.leaveId);
    return { removed: true };
  },
});

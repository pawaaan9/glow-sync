import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { getSalonOwnerDashboard } from "@/server/services/dashboardService";

export const runtime = "nodejs";

export const GET = defineRoute({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return getSalonOwnerDashboard(salon.id);
  },
});

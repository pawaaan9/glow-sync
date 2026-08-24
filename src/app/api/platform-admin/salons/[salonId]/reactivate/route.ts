import { ROLES } from "@/lib/shared";
import { ADMIN_ACTION_RATE_LIMIT } from "@/server/http/rateLimit";
import { defineRoute } from "@/server/http/route";
import { reactivateSalon } from "@/server/services/salonApplicationService";

export const runtime = "nodejs";

export const PATCH = defineRoute<undefined, undefined, { salonId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  rateLimit: ADMIN_ACTION_RATE_LIMIT,
  handler: async ({ params, user }) => {
    await reactivateSalon(params.salonId, user.uid);
    return { reactivated: true };
  },
});

import { ROLES, reasonRequiredSchema, type ReasonRequiredInput } from "@/lib/shared";
import { ADMIN_ACTION_RATE_LIMIT } from "@/server/http/rateLimit";
import { defineRoute } from "@/server/http/route";
import { suspendSalon } from "@/server/services/salonApplicationService";

export const runtime = "nodejs";

export const PATCH = defineRoute<ReasonRequiredInput, undefined, { salonId: string }>({
  roles: [ROLES.PLATFORM_ADMIN],
  rateLimit: ADMIN_ACTION_RATE_LIMIT,
  body: reasonRequiredSchema,
  handler: async ({ params, user, body }) => {
    await suspendSalon(params.salonId, user.uid, body.reason);
    return { suspended: true };
  },
});

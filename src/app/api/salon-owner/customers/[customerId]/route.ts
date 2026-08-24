import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { getCustomer } from "@/server/services/customerService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { customerId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return getCustomer(salon.id, params.customerId);
  },
});

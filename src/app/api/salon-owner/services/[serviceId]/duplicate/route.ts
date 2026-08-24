import { ROLES } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { duplicateService } from "@/server/services/serviceCatalogService";

export const runtime = "nodejs";

export const POST = defineRoute<undefined, undefined, { serviceId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return duplicateService(salon.id, user.uid, params.serviceId);
  },
});

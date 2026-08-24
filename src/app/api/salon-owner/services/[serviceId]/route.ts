import { ROLES, servicePatchSchema, type ServicePatchInput } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { getService, updateService } from "@/server/services/serviceCatalogService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, undefined, { serviceId: string }>({
  roles: [ROLES.SALON_OWNER],
  handler: async ({ user, params }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return getService(salon.id, params.serviceId);
  },
});

export const PATCH = defineRoute<ServicePatchInput, undefined, { serviceId: string }>({
  roles: [ROLES.SALON_OWNER],
  body: servicePatchSchema,
  handler: async ({ user, params, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return updateService(salon.id, user.uid, params.serviceId, body);
  },
});

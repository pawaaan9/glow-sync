import { ROLES, servicesQuerySchema, serviceSchema, type ServiceInput, type ServicesQuery } from "@/lib/shared";
import { requireActiveSalon, requireVerifiedSalonOwner } from "@/server/http/auth";
import { defineRoute } from "@/server/http/route";
import { createService, listServices } from "@/server/services/serviceCatalogService";

export const runtime = "nodejs";

export const GET = defineRoute<undefined, ServicesQuery>({
  roles: [ROLES.SALON_OWNER],
  query: servicesQuerySchema,
  handler: async ({ user, query }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return listServices(salon.id, query);
  },
});

export const POST = defineRoute<ServiceInput>({
  roles: [ROLES.SALON_OWNER],
  body: serviceSchema,
  handler: async ({ user, body }) => {
    requireVerifiedSalonOwner(user);
    const salon = await requireActiveSalon(user);
    return createService(salon.id, user.uid, body);
  },
});
